import { useState, useMemo } from 'react';
import {
  Building2, Plus, Search, Phone, Mail, Globe, MapPin,
  Star, Package, Edit3, Trash2,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import SearchInput from '../components/common/SearchInput';
import EmptyState from '../components/common/EmptyState';
import { formatDate } from '../utils/formatters';

const SAMPLE_VENDORS = [
  { id: 'v1', name: 'National Fire Supplies', contact: 'James Mitchell', email: 'sales@nfs.com.au', phone: '02 9876 5432', website: 'nfs.com.au', location: 'Sydney, NSW', rating: 4.5, categories: ['Sprinkler', 'Hydrant'], notes: 'Primary sprinkler supplier. Good pricing on Viking heads.', lastOrder: '2025-12-15' },
  { id: 'v2', name: 'FireTech Wholesale', contact: 'Sarah Lee', email: 'orders@firetech.com.au', phone: '03 1234 5678', website: 'firetech.com.au', location: 'Melbourne, VIC', rating: 4.2, categories: ['Alarm', 'Detection', 'EWIS'], notes: 'Notifier authorised distributor. Fast delivery.', lastOrder: '2026-01-20' },
  { id: 'v3', name: 'Hilti Australia', contact: 'Account Manager', email: 'au.sales@hilti.com', phone: '1300 445 849', website: 'hilti.com.au', location: 'National', rating: 4.8, categories: ['Passive Fire'], notes: 'Premium passive fire products. CP 644 collars and FS-ONE MAX sealant.', lastOrder: '2026-02-01' },
  { id: 'v4', name: 'Allied Fire Products', contact: 'Mark Thompson', email: 'mark@alliedfire.com.au', phone: '07 3456 7890', website: 'alliedfire.com.au', location: 'Brisbane, QLD', rating: 4.0, categories: ['Extinguisher', 'Hose Reels'], notes: 'Competitive pricing on portable equipment.', lastOrder: '2025-11-30' },
  { id: 'v5', name: 'SafeGuard Distribution', contact: 'Emma Davis', email: 'emma@safeguard.com.au', phone: '08 6543 2109', website: 'safeguard.com.au', location: 'Perth, WA', rating: 3.8, categories: ['Sprinkler', 'Alarm', 'Extinguisher'], notes: 'WA-based distributor. Higher prices but fast local delivery.', lastOrder: '2025-10-15' },
];

export default function Vendors() {
  const [vendors, setVendors] = useState(SAMPLE_VENDORS);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [form, setForm] = useState({ name: '', contact: '', email: '', phone: '', website: '', location: '', categories: '', notes: '' });

  const filtered = useMemo(() => {
    if (!search) return vendors;
    const q = search.toLowerCase();
    return vendors.filter((v) =>
      v.name.toLowerCase().includes(q) || v.location.toLowerCase().includes(q) ||
      v.categories.some((c) => c.toLowerCase().includes(q))
    );
  }, [vendors, search]);

  function handleCreate(e) {
    e.preventDefault();
    setVendors((prev) => [...prev, {
      id: `v${Date.now()}`,
      ...form,
      categories: form.categories.split(',').map((c) => c.trim()).filter(Boolean),
      rating: 0,
      lastOrder: null,
    }]);
    setForm({ name: '', contact: '', email: '', phone: '', website: '', location: '', categories: '', notes: '' });
    setShowCreate(false);
  }

  function renderStars(rating) {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={12} fill={i < Math.floor(rating) ? 'var(--color-warning-400)' : 'transparent'}
        style={{ color: i < Math.floor(rating) ? 'var(--color-warning-400)' : 'var(--color-border)' }}
      />
    ));
  }

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Vendors</h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', margin: '4px 0 0' }}>Manage supplier relationships and pricing</p>
        </div>
        <Button onClick={() => setShowCreate(true)} icon={Plus}>Add Vendor</Button>
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder="Search vendors, locations, categories..." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16, marginTop: 16 }}>
        {filtered.map((vendor) => (
          <Card key={vendor.id} hover onClick={() => setSelectedVendor(vendor)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{vendor.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>{vendor.contact}</div>
              </div>
              <div style={{ display: 'flex', gap: 1 }}>{renderStars(vendor.rating)}</div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: 10 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {vendor.location}</span>
              {vendor.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12} /> {vendor.phone}</span>}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
              {vendor.categories.map((cat) => (
                <span key={cat} style={{
                  fontSize: '0.625rem', padding: '2px 8px', borderRadius: 'var(--radius-full)',
                  background: 'var(--color-fire-50)', color: 'var(--color-fire-700)', fontWeight: 500,
                }}>
                  {cat}
                </span>
              ))}
            </div>

            {vendor.notes && (
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>{vendor.notes}</div>
            )}
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <EmptyState
          icon={Building2}
          title="No vendors found"
          description={search ? 'Try adjusting your search' : 'Add your first vendor to manage supplier relationships'}
          primaryAction={!search ? { label: 'Add Vendor', onClick: () => setShowCreate(true) } : undefined}
        />
      )}

      {/* Vendor Detail Modal */}
      <Modal isOpen={!!selectedVendor} onClose={() => setSelectedVendor(null)} title={selectedVendor?.name || 'Vendor'} size="md">
        {selectedVendor && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <DetailRow label="Contact" value={selectedVendor.contact} />
              <DetailRow label="Rating" value={<div style={{ display: 'flex', gap: 1 }}>{renderStars(selectedVendor.rating)}</div>} />
              <DetailRow label="Email" value={selectedVendor.email} />
              <DetailRow label="Phone" value={selectedVendor.phone} />
              <DetailRow label="Website" value={selectedVendor.website} />
              <DetailRow label="Location" value={selectedVendor.location} />
              <DetailRow label="Last Order" value={selectedVendor.lastOrder ? formatDate(selectedVendor.lastOrder) : 'No orders'} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Categories</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {selectedVendor.categories.map((cat) => (
                  <span key={cat} style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'var(--color-fire-50)', color: 'var(--color-fire-700)', fontWeight: 500 }}>
                    {cat}
                  </span>
                ))}
              </div>
            </div>
            {selectedVendor.notes && (
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Notes</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-primary)', background: 'var(--color-bg-secondary)', padding: 12, borderRadius: 'var(--radius-md)' }}>{selectedVendor.notes}</div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Vendor" size="md">
        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Company Name *</label>
              <input style={inputStyle} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label style={labelStyle}>Contact Person</label>
              <input style={inputStyle} value={form.contact} onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input style={inputStyle} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Location</label>
              <input style={inputStyle} value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Categories (comma separated)</label>
              <input style={inputStyle} value={form.categories} onChange={(e) => setForm((f) => ({ ...f, categories: e.target.value }))} placeholder="Sprinkler, Alarm, Passive Fire" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Notes</label>
              <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Button variant="secondary" onClick={() => setShowCreate(false)} type="button">Cancel</Button>
            <Button type="submit">Add Vendor</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>{value}</div>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 };
const inputStyle = {
  width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)', background: 'var(--color-bg-input)',
  color: 'var(--color-text-primary)', fontSize: '0.8125rem', outline: 'none', boxSizing: 'border-box',
};
