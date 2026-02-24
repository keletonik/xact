import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HelpCircle,
  Search,
  BookOpen,
  Video,
  MessageCircle,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Shield,
  ClipboardCheck,
  Building2,
  Wrench,
  Flame,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import SearchInput from '../components/common/SearchInput';

const faqCategories = [
  {
    title: 'Getting Started',
    icon: BookOpen,
    items: [
      { q: 'How do I add my first building?', a: 'Navigate to the Buildings page from the sidebar and click "Add Building". Fill in the required information including building name, address, type, and fire protection systems installed.' },
      { q: 'How do I schedule an inspection?', a: 'Go to the Inspections page and click "New Inspection". Select the building, inspection type, date, and assign an inspector. The inspection will appear on both the Inspections list and the Schedule calendar.' },
      { q: 'How do I invite team members?', a: 'Go to the Team page and click "Add Team Member". Enter their name, email, and role. They will receive an email invitation to join your organization.' },
    ],
  },
  {
    title: 'Inspections',
    icon: ClipboardCheck,
    items: [
      { q: 'What inspection types are supported?', a: 'Evalux supports all NFPA inspection types including Annual Fire Inspections, Quarterly Sprinkler Inspections, Semi-Annual Fire Alarm Tests, Kitchen Hood System Inspections, Fire Pump Tests, and more.' },
      { q: 'How do I record inspection findings?', a: 'During or after an inspection, open the inspection record and use the checklist to mark each item as passed, failed, or pending. Add notes and photos for any deficiencies found.' },
      { q: 'Can I generate inspection reports?', a: 'Yes! Go to the Reports page and select the Inspection Activity Report template. You can generate PDF or Excel reports filtered by date range, building, or inspector.' },
    ],
  },
  {
    title: 'Compliance',
    icon: Shield,
    items: [
      { q: 'How does compliance tracking work?', a: 'Evalux tracks compliance against NFPA codes and local fire marshal requirements. Each building has compliance records that are updated automatically based on inspection results and manual entries.' },
      { q: 'What happens when a building is non-compliant?', a: 'When a building falls out of compliance, the system generates alerts, creates work orders for corrective actions, and tracks remediation until compliance is restored.' },
    ],
  },
  {
    title: 'Equipment',
    icon: Flame,
    items: [
      { q: 'How do I track equipment maintenance?', a: 'Add equipment through the Equipment page. Set up service schedules, warranty dates, and the system will automatically remind you when maintenance is due.' },
      { q: 'Can I import equipment lists?', a: 'Yes, you can import equipment data via CSV or Excel files. Go to Equipment > Import and upload your file following the provided template format.' },
    ],
  },
];

export default function Help() {
  const [search, setSearch] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleFaq = (key) => {
    setExpandedFaq(prev => prev === key ? null : key);
  };

  return (
    <div>
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
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 32,
      }}>
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
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(135deg, var(--color-fire-50), var(--color-fire-100))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}>
                <item.icon size={24} style={{ color: 'var(--color-fire-600)' }} />
              </div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 4 }}>{item.label}</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{item.desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* FAQ Sections */}
      <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 20 }}>Frequently Asked Questions</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {faqCategories.map((cat) => {
          const CatIcon = cat.icon;
          return (
            <Card key={cat.title}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <CatIcon size={18} style={{ color: 'var(--color-fire-500)' }} />
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{cat.title}</h3>
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
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 0',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: 'var(--text-primary)',
                          borderBottom: isExpanded ? 'none' : '1px solid var(--border-secondary)',
                          textAlign: 'left',
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
                            padding: '8px 0 16px',
                            fontSize: '0.8125rem',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.7,
                            borderBottom: '1px solid var(--border-secondary)',
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
    </div>
  );
}
