import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HelpCircle, Search, BookOpen, Video, MessageCircle, Mail,
  ChevronDown, ChevronUp, Calculator, Ruler, FileText,
  DollarSign, FolderOpen, BarChart3, Settings,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import SearchInput from '../components/common/SearchInput';

const faqCategories = [
  {
    title: 'Getting Started',
    icon: BookOpen,
    items: [
      { q: 'How do I create my first project?', a: 'Navigate to Projects from the sidebar and click "New Project". Fill in the project name, client details, region, and estimation scope. The project will appear in your pipeline and can be linked to estimates and proposals.' },
      { q: 'What is the typical estimating workflow?', a: 'The standard workflow is: Create a Project → Upload plans in Takeoff → Measure quantities using the takeoff tools → Build an Estimate from takeoff data or manually → Generate a Proposal to send to the client. Each step feeds into the next for a seamless process.' },
      { q: 'How do I navigate quickly between pages?', a: 'Use the Command Palette by pressing Cmd+K (or Ctrl+K on Windows). You can search for any page, create new projects, estimates, or proposals directly from the palette.' },
    ],
  },
  {
    title: 'Takeoff & Measurement',
    icon: Ruler,
    items: [
      { q: 'How do I upload plans for takeoff?', a: 'Go to the Takeoff page and create a new package. Upload your plan set (PDF or image files), set the scale calibration, then use the measurement tools (Count, Linear, Area) to measure quantities directly on the plans.' },
      { q: 'What measurement types are available?', a: 'Evalux supports Count (for individual items like sprinkler heads, detectors), Linear (for pipe runs, cable routes), Area (for coverage zones, ceiling areas), and Volume measurements. Use keyboard shortcuts V (Select), C (Count), L (Linear), A (Area), H (Pan) for fast switching.' },
      { q: 'How do layers work in takeoff?', a: 'Layers let you organise measurements by system or category (e.g., Sprinkler, Alarm, Passive Fire). Each layer can be toggled on/off for visibility. Objects on hidden layers are still included in calculations unless explicitly excluded.' },
    ],
  },
  {
    title: 'Estimates & Pricing',
    icon: Calculator,
    items: [
      { q: 'How do I build an estimate?', a: 'Create a new estimate from the Estimates page, link it to a project, then add line items manually or by expanding assemblies from the Price Book. Each line calculates cost based on the multi-layer pricing engine. Adjust markups for overhead, profit, contingency, and risk.' },
      { q: 'What are assemblies and how do they work?', a: 'Assemblies are pre-configured groups of items that expand into multiple line items. For example, a "Standard Sprinkler Head" assembly includes the head, pipe fittings, hangers, and labour. Enter a driver quantity (e.g., 50 heads) and the assembly auto-calculates all component quantities with wastage and slack factors.' },
      { q: 'How does the pricing engine resolve unit prices?', a: 'The engine resolves prices through 6 layers: Base price → Supplier override → Region modifier → Escalation → Project-specific rates → Access difficulty factor. This ensures pricing reflects real-world conditions for each project.' },
      { q: 'How do I compare estimate versions?', a: 'Save a version snapshot at any point using "Save Version". Go to the version history to compare any two versions side-by-side. The diff shows added, modified, and removed lines with exact field-level changes.' },
    ],
  },
  {
    title: 'Price Book & Vendors',
    icon: DollarSign,
    items: [
      { q: 'How do I manage the Price Book?', a: 'The Price Book contains all your items and assemblies organised by fire scope (Sprinkler, Alarm, Passive Fire, Portable Equipment). Edit any item\'s price, unit, or details — all changes require a reason and are logged in the audit trail.' },
      { q: 'What are pending price updates?', a: 'When the Price Scout suggests new pricing based on market data, updates go into a pending approval queue. A senior estimator must review and approve or reject each update before it takes effect. This human-in-the-loop approach ensures pricing accuracy.' },
      { q: 'How do I manage vendor relationships?', a: 'Use the Vendors page to track suppliers, their contact details, product categories, ratings, and notes. Link vendors to Price Book items for supplier-specific pricing overrides.' },
    ],
  },
  {
    title: 'Proposals & Pipeline',
    icon: FileText,
    items: [
      { q: 'How do I generate a proposal?', a: 'Go to Proposals and click "New Proposal". Select a project, link an estimate, choose a template (Standard, Detailed, or Executive), and configure inclusions/exclusions from the library. Preview the formatted proposal before sending.' },
      { q: 'How does the project pipeline work?', a: 'Projects move through stages: Lead → Opportunity → Quoting → Quoted → Won/Lost. The Dashboard shows pipeline statistics and total pipeline value. Use the Opportunities page for a Kanban-style view of your pipeline.' },
    ],
  },
  {
    title: 'Admin & Audit',
    icon: Settings,
    items: [
      { q: 'What actions are tracked in the audit log?', a: 'Every sensitive action is logged: creating/editing/deleting projects, estimates, proposals, price book changes, price approvals/rejections, version snapshots, and status changes. Each entry includes timestamp, user, action type, and details.' },
      { q: 'How do I export audit data?', a: 'Go to Admin → Audit Log and click "Export CSV". The export includes all log entries with full details, filterable by date range, action type, or user.' },
      { q: 'What does the Data Integrity check do?', a: 'The integrity checker in Admin → Data Integrity runs automated validations: estimate total consistency (recalculates and compares), anomaly detection (unusually high prices, zero quantities, negative totals), and zero-price item alerts.' },
    ],
  },
];

export default function Help() {
  const [search, setSearch] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleFaq = (key) => {
    setExpandedFaq((prev) => (prev === key ? null : key));
  };

  const filteredCategories = search
    ? faqCategories.map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.q.toLowerCase().includes(search.toLowerCase()) ||
            item.a.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter((cat) => cat.items.length > 0)
    : faqCategories;

  return (
    <div style={{ padding: '24px 32px' }}>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '40px 32px',
          textAlign: 'center',
          marginBottom: 32,
        }}
      >
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: 8 }}>
          How can we help you?
        </h2>
        <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>
          Search our knowledge base or browse frequently asked questions
        </p>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search for help topics..." />
        </div>
      </motion.div>

      {/* Quick Links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { icon: BookOpen, label: 'Documentation', desc: 'Guides & tutorials' },
          { icon: Video, label: 'Video Tutorials', desc: 'Step-by-step videos' },
          { icon: MessageCircle, label: 'Live Chat', desc: 'Chat with support' },
          { icon: Mail, label: 'Email Support', desc: 'support@evalux.com' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card hover style={{ textAlign: 'center', padding: '24px 20px' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(135deg, var(--color-fire-50), var(--color-fire-100))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px',
              }}>
                <item.icon size={24} style={{ color: 'var(--color-fire-600)' }} />
              </div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 4 }}>{item.label}</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{item.desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* FAQ Sections */}
      <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 20, color: 'var(--color-text-primary)' }}>Frequently Asked Questions</h2>
      {filteredCategories.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>
          No results found for "{search}"
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredCategories.map((cat) => {
            const CatIcon = cat.icon;
            return (
              <Card key={cat.title}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <CatIcon size={18} style={{ color: 'var(--color-fire-500)' }} />
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{cat.title}</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {cat.items.map((item, i) => {
                    const key = `${cat.title}-${i}`;
                    const isExpanded = expandedFaq === key;
                    return (
                      <div key={key}>
                        <button
                          onClick={() => toggleFaq(key)}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between', padding: '12px 0',
                            fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)',
                            borderBottom: isExpanded ? 'none' : '1px solid var(--color-border)',
                            textAlign: 'left', background: 'none', border: 'none',
                            borderBottomWidth: 1, borderBottomStyle: 'solid',
                            borderBottomColor: isExpanded ? 'transparent' : 'var(--color-border)',
                            cursor: 'pointer',
                          }}
                        >
                          {item.q}
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{
                              padding: '8px 0 16px', fontSize: '0.8125rem',
                              color: 'var(--color-text-secondary)', lineHeight: 1.7,
                              borderBottom: '1px solid var(--color-border)',
                            }}
                          >
                            {item.a}
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
