import { describe, it, expect } from 'vitest';
import { generateCertPack } from './generators';
import { CERT_PACK_TYPES, CERT_PACK_TYPE_LABELS } from '../utils/constants';

describe('cert pack type registry', () => {
  it('has a label for every cert pack type', () => {
    for (const t of Object.values(CERT_PACK_TYPES)) {
      expect(CERT_PACK_TYPE_LABELS[t], `missing label for ${t}`).toBeTruthy();
    }
  });

  it('exposes the AFSS evidence support pack type', () => {
    expect(CERT_PACK_TYPES.AFSS_EVIDENCE).toBe('afss_evidence');
    expect(CERT_PACK_TYPE_LABELS[CERT_PACK_TYPES.AFSS_EVIDENCE]).toMatch(/evidence support/i);
  });
});

describe('generateCertPack', () => {
  const project = {
    id: 'p1', name: 'Test project', client: 'ACME', siteAddress: '100 George St, Sydney NSW 2000',
  };
  const assets = [
    { id: 'a1', tag: 'FS-L5-001', assetType: 'penetration', status: 'installed', requiredFrl: '-/120/120', achievedFrl: '-/120/120' },
  ];

  it('rejects an unknown pack type', async () => {
    await expect(generateCertPack({ type: 'nope', project, assets, systems: [], photos: [] }))
      .rejects.toThrow(/unknown cert pack type/i);
  });

  it('produces a non-empty PDF blob for the AFSS evidence pack', async () => {
    const blob = await generateCertPack({
      type: CERT_PACK_TYPES.AFSS_EVIDENCE,
      project, assets, systems: [], photos: [], defects: [], inspections: [],
    });
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });
});
