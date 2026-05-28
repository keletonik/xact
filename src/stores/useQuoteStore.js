import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import db from '../services/db';
import useAuditStore from './useAuditStore';
import useAssetStore from './useAssetStore';
import { AUDIT_ACTIONS, ASSET_STATUSES } from '../utils/constants';

/**
 * Quote and QuoteLineItem persistence.
 *
 * Quote total is the sum of every line item's totalCents and is the
 * source of truth — never trust an in-memory aggregate. Money is stored
 * as integer cents to avoid floating-point drift on multiplication.
 *
 * Quote → asset conversion: marking a quote 'accepted' (won)
 * materialises every line item into N PLANNED Asset rows where N is
 * the line item qty. This is the bridge from estimating to operations.
 * Once converted, the line item carries convertedToAssetIds so a quote
 * cannot accidentally be re-converted.
 */
const useQuoteStore = create((set, get) => ({
  quotes: [],
  lineItemsByQuote: {}, // quoteId -> QuoteLineItem[]
  ready: false,

  async hydrate() {
    const [quotes, lines] = await Promise.all([
      db.quotes.toArray(),
      db.quoteLineItems.toArray(),
    ]);
    quotes.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    const lineItemsByQuote = {};
    for (const l of lines) (lineItemsByQuote[l.quoteId] ??= []).push(l);
    set({ quotes, lineItemsByQuote, ready: true });
  },

  forProject(projectId) {
    return get().quotes.filter((q) => q.projectId === projectId);
  },

  linesFor(quoteId) {
    return get().lineItemsByQuote[quoteId] || [];
  },

  async createQuote(input) {
    const now = new Date().toISOString();
    const peers = get().quotes.filter((q) => q.projectId === input.projectId);
    const nextVersion = peers.length === 0
      ? 1
      : Math.max(...peers.map((q) => q.version || 0)) + 1;
    const quote = {
      id: input.id || uuid(),
      projectId: input.projectId,
      version: nextVersion,
      status: 'draft',
      totalCents: 0,
      notes: input.notes || '',
      createdAt: now,
      updatedAt: now,
    };
    await db.quotes.put(quote);
    set((s) => ({
      quotes: [quote, ...s.quotes],
      lineItemsByQuote: { ...s.lineItemsByQuote, [quote.id]: [] },
    }));
    return quote;
  },

  async addLine(quoteId, input) {
    const quote = await db.quotes.get(quoteId);
    if (!quote || quote.status !== 'draft') throw new Error('Only draft quotes accept new lines');
    const qty = Math.max(1, Number(input.qty) || 1);
    const unitRateCents = Math.round(Number(input.unitRateCents) || 0);
    const materialsCents = Math.round(Number(input.materialsCents) || 0);
    const labourHours = Math.max(0, Number(input.labourHours) || 0);
    const line = {
      id: input.id || uuid(),
      quoteId,
      description: input.description || '',
      assetType: input.assetType,
      substrate: input.substrate || null,
      requiredFrl: input.requiredFrl || '',
      services: input.services || [],
      qty,
      unitRateCents,
      materialsCents,
      labourHours,
      totalCents: qty * (unitRateCents + materialsCents),
      convertedToAssetIds: [],
    };
    await db.quoteLineItems.put(line);
    const all = get().linesFor(quoteId).concat(line);
    await persistTotal(quoteId, all);
    set((s) => ({
      lineItemsByQuote: { ...s.lineItemsByQuote, [quoteId]: all },
      quotes: s.quotes.map((q) => (q.id === quoteId ? { ...q, totalCents: sumLines(all), updatedAt: new Date().toISOString() } : q)),
    }));
    return line;
  },

  async updateLine(quoteId, lineId, patch) {
    const line = await db.quoteLineItems.get(lineId);
    if (!line || line.quoteId !== quoteId) return null;
    const qty = patch.qty !== undefined ? Math.max(1, Number(patch.qty) || 1) : line.qty;
    const unitRateCents = patch.unitRateCents !== undefined ? Math.round(Number(patch.unitRateCents) || 0) : line.unitRateCents;
    const materialsCents = patch.materialsCents !== undefined ? Math.round(Number(patch.materialsCents) || 0) : line.materialsCents;
    const next = {
      ...line,
      ...patch,
      qty, unitRateCents, materialsCents,
      totalCents: qty * (unitRateCents + materialsCents),
    };
    await db.quoteLineItems.put(next);
    const all = get().linesFor(quoteId).map((l) => (l.id === lineId ? next : l));
    await persistTotal(quoteId, all);
    set((s) => ({
      lineItemsByQuote: { ...s.lineItemsByQuote, [quoteId]: all },
      quotes: s.quotes.map((q) => (q.id === quoteId ? { ...q, totalCents: sumLines(all), updatedAt: new Date().toISOString() } : q)),
    }));
    return next;
  },

  async removeLine(quoteId, lineId) {
    await db.quoteLineItems.delete(lineId);
    const all = get().linesFor(quoteId).filter((l) => l.id !== lineId);
    await persistTotal(quoteId, all);
    set((s) => ({
      lineItemsByQuote: { ...s.lineItemsByQuote, [quoteId]: all },
      quotes: s.quotes.map((q) => (q.id === quoteId ? { ...q, totalCents: sumLines(all), updatedAt: new Date().toISOString() } : q)),
    }));
  },

  async setStatus(quoteId, status) {
    const quote = await db.quotes.get(quoteId);
    if (!quote) return null;
    const next = { ...quote, status, updatedAt: new Date().toISOString() };
    await db.quotes.put(next);
    set((s) => ({ quotes: s.quotes.map((q) => (q.id === quoteId ? next : q)) }));
    return next;
  },

  /**
   * Materialise an accepted quote into PLANNED Asset rows. Each line
   * item creates `qty` assets, all populated from the line's template
   * (asset type, substrate, required FRL). Returns the array of
   * created asset IDs grouped by line item.
   */
  async convertToAssets(quoteId) {
    const quote = await db.quotes.get(quoteId);
    if (!quote) throw new Error('Quote not found');
    if (quote.status !== 'accepted') throw new Error('Convert: quote must be accepted');

    const lines = await db.quoteLineItems.where('quoteId').equals(quoteId).toArray();
    const allCreated = {};
    const createAsset = useAssetStore.getState().createAsset;

    for (const line of lines) {
      if (line.convertedToAssetIds?.length > 0) continue;
      const created = [];
      for (let i = 0; i < line.qty; i += 1) {
        const asset = await createAsset({
          asset: {
            projectId: quote.projectId,
            assetType: line.assetType,
            substrate: line.substrate,
            requiredFrl: line.requiredFrl,
            status: ASSET_STATUSES.PLANNED,
            notes: line.description ? `From quote v${quote.version}: ${line.description}` : `From quote v${quote.version}`,
          },
        });
        created.push(asset.id);
      }
      const updatedLine = { ...line, convertedToAssetIds: created };
      await db.quoteLineItems.put(updatedLine);
      allCreated[line.id] = created;
    }

    // refresh in-memory line items
    const refreshed = await db.quoteLineItems.where('quoteId').equals(quoteId).toArray();
    set((s) => ({ lineItemsByQuote: { ...s.lineItemsByQuote, [quoteId]: refreshed } }));

    useAuditStore.getState().log(AUDIT_ACTIONS.PROJECT_UPDATED, {
      entityType: 'quote', entityId: quoteId,
      description: `Converted quote v${quote.version} into ${Object.values(allCreated).flat().length} planned assets`,
    });
    return allCreated;
  },
}));

function sumLines(lines) {
  return lines.reduce((acc, l) => acc + (l.totalCents || 0), 0);
}

async function persistTotal(quoteId, lines) {
  const totalCents = sumLines(lines);
  const quote = await db.quotes.get(quoteId);
  if (!quote) return;
  await db.quotes.put({ ...quote, totalCents, updatedAt: new Date().toISOString() });
}

export default useQuoteStore;
