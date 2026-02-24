import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, LayoutDashboard, Users, FolderOpen, Ruler, Calculator, FileText,
  BookOpen, Building2, BarChart3, Shield, Settings, ArrowRight, Command,
} from 'lucide-react';

const COMMANDS = [
  { id: 'dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, path: '/', section: 'Navigation' },
  { id: 'opportunities', label: 'Go to Opportunities', icon: Users, path: '/opportunities', section: 'Navigation' },
  { id: 'projects', label: 'Go to Projects', icon: FolderOpen, path: '/projects', section: 'Navigation' },
  { id: 'takeoff', label: 'Go to Takeoff', icon: Ruler, path: '/takeoff', section: 'Navigation' },
  { id: 'estimates', label: 'Go to Estimates', icon: Calculator, path: '/estimates', section: 'Navigation' },
  { id: 'proposals', label: 'Go to Proposals', icon: FileText, path: '/proposals', section: 'Navigation' },
  { id: 'pricebook', label: 'Go to Price Book', icon: BookOpen, path: '/price-book', section: 'Navigation' },
  { id: 'vendors', label: 'Go to Vendors', icon: Building2, path: '/vendors', section: 'Navigation' },
  { id: 'reports', label: 'Go to Reports', icon: BarChart3, path: '/reports', section: 'Navigation' },
  { id: 'admin', label: 'Go to Admin', icon: Shield, path: '/admin', section: 'Navigation' },
  { id: 'settings', label: 'Go to Settings', icon: Settings, path: '/settings', section: 'Navigation' },
  { id: 'new-project', label: 'Create New Project', icon: FolderOpen, path: '/projects?action=new', section: 'Actions' },
  { id: 'new-estimate', label: 'Create New Estimate', icon: Calculator, path: '/estimates?action=new', section: 'Actions' },
  { id: 'new-proposal', label: 'Create New Proposal', icon: FileText, path: '/proposals?action=new', section: 'Actions' },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
    if (!open) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!query) return COMMANDS;
    const q = query.toLowerCase();
    return COMMANDS.filter(
      (cmd) => cmd.label.toLowerCase().includes(q) || cmd.section.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  function handleSelect(cmd) {
    setOpen(false);
    navigate(cmd.path);
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      handleSelect(filtered[selectedIndex]);
    }
  }

  const grouped = useMemo(() => {
    const groups = {};
    for (const cmd of filtered) {
      if (!groups[cmd.section]) groups[cmd.section] = [];
      groups[cmd.section].push(cmd);
    }
    return groups;
  }, [filtered]);

  let flatIndex = -1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '20vh',
            background: 'var(--color-overlay)',
          }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 560,
              background: 'var(--color-bg-card)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--color-border)', gap: 10 }}>
              <Search size={18} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or search..."
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: '0.95rem',
                  color: 'var(--color-text-primary)',
                }}
              />
              <kbd style={{
                padding: '2px 6px',
                borderRadius: 4,
                border: '1px solid var(--color-border)',
                fontSize: '0.7rem',
                color: 'var(--color-text-tertiary)',
                background: 'var(--color-bg-secondary)',
              }}>ESC</kbd>
            </div>

            <div style={{ maxHeight: 320, overflowY: 'auto', padding: '8px 0' }}>
              {filtered.length === 0 && (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>
                  No results found
                </div>
              )}

              {Object.entries(grouped).map(([section, commands]) => (
                <div key={section}>
                  <div style={{
                    padding: '8px 16px 4px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--color-text-tertiary)',
                  }}>
                    {section}
                  </div>
                  {commands.map((cmd) => {
                    flatIndex++;
                    const idx = flatIndex;
                    const Icon = cmd.icon;
                    return (
                      <div
                        key={cmd.id}
                        onClick={() => handleSelect(cmd)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '8px 16px',
                          cursor: 'pointer',
                          background: selectedIndex === idx ? 'var(--color-bg-tertiary)' : 'transparent',
                          color: selectedIndex === idx ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                          transition: 'background 0.1s',
                        }}
                      >
                        <Icon size={16} style={{ flexShrink: 0, opacity: 0.7 }} />
                        <span style={{ flex: 1, fontSize: '0.875rem' }}>{cmd.label}</span>
                        <ArrowRight size={14} style={{ opacity: selectedIndex === idx ? 0.5 : 0 }} />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div style={{
              padding: '8px 16px',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              fontSize: '0.7rem',
              color: 'var(--color-text-tertiary)',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <kbd style={{ padding: '1px 4px', borderRadius: 3, border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>↑↓</kbd>
                Navigate
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <kbd style={{ padding: '1px 4px', borderRadius: 3, border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>↵</kbd>
                Select
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Command size={10} />
                <kbd style={{ padding: '1px 4px', borderRadius: 3, border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>K</kbd>
                Toggle
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
