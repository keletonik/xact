import { z } from 'zod';
import { ITEM_CATEGORIES, UNITS } from '../utils/constants';

/**
 * Runtime schemas (Zod) for catalog aggregates.
 * Used by the CSV import pipeline and form validators.
 */

const categoryEnum = z.enum(Object.values(ITEM_CATEGORIES));
const unitEnum = z.enum(Object.values(UNITS));

export const productSchema = z.object({
  id: z.string(),
  sku: z.string().max(64).optional().default(''),
  name: z.string().min(1).max(240),
  description: z.string().max(2000).optional().default(''),
  category: categoryEnum,
  unit: unitEnum,
  brand: z.string().max(120).optional().default(''),
  model: z.string().max(120).optional().default(''),
  manufacturer: z.string().max(120).optional().default(''),
  datasheetUrl: z.string().url().optional().or(z.literal('')),
  hsCode: z.string().max(20).optional().default(''),
  gtin: z.string().max(20).optional().default(''),
  basePriceCents: z.number().int().nonnegative(),
  currency: z.string().length(3).default('AUD'),
  tags: z.array(z.string()).default([]),
  standards: z.array(z.string()).default([]),
  isCustom: z.boolean().default(true),
  isArchived: z.boolean().default(false),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  createdBy: z.string().optional(),
});

export const supplierSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(240),
  abn: z.string().max(20).optional().default(''),
  contact: z.string().max(120).optional().default(''),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(40).optional().default(''),
  address: z.string().max(500).optional().default(''),
  terms: z.string().max(500).optional().default(''),
  currency: z.string().length(3).default('AUD'),
  notes: z.string().max(2000).optional().default(''),
});

export const supplierPriceSchema = z.object({
  id: z.string(),
  productId: z.string(),
  supplierId: z.string(),
  supplierSku: z.string().max(64).optional().default(''),
  unitPriceCents: z.number().int().nonnegative(),
  currency: z.string().length(3).default('AUD'),
  fxRateToAUD: z.number().positive().default(1),
  moq: z.number().int().positive().default(1),
  packSize: z.number().int().positive().default(1),
  freightCents: z.number().int().nonnegative().default(0),
  leadTimeDays: z.number().int().nonnegative().default(0),
  effectiveFrom: z.string().datetime(),
  effectiveTo: z.string().datetime().nullable().default(null),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  importBatchId: z.string().optional(),
  isPreferred: z.boolean().default(false),
  notes: z.string().max(1000).optional().default(''),
});

export const labourTaskSchema = z.object({
  id: z.string(),
  trade: z.string().min(1).max(80),
  task: z.string().min(1).max(240),
  unit: unitEnum,
  unitsPerHour: z.number().positive(),
  hourlyRateCents: z.number().int().nonnegative(),
  regionMultipliers: z.record(z.string(), z.number().positive()).default({}),
  accessMultipliers: z.record(z.string(), z.number().positive()).default({}),
  notes: z.string().max(1000).optional().default(''),
});

/** Convert dollars (string or number) to integer cents. Tolerant of "$", commas, parens. */
export function dollarsToCents(input) {
  if (input == null || input === '') return 0;
  if (typeof input === 'number') return Math.round(input * 100);
  const cleaned = String(input)
    .replace(/[,$\s]/g, '')
    .replace(/^\((.*)\)$/, '-$1');
  const n = Number.parseFloat(cleaned);
  if (Number.isNaN(n)) return 0;
  return Math.round(n * 100);
}

/** Inverse for display. */
export function centsToDollars(cents) {
  return (cents || 0) / 100;
}
