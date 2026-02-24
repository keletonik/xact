import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Plus,
  ClipboardCheck,
  Wrench,
  Building2,
  User,
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday, isSameDay } from 'date-fns';
import Card, { CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import StatusBadge from '../components/common/StatusBadge';
import { inspections, workOrders } from '../data/mockData';

export default function Schedule() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);

  // Combine inspections and work orders into calendar events
  const events = [
    ...inspections.map(i => ({
      id: i.id,
      title: i.type,
      date: i.scheduledDate,
      type: 'inspection',
      status: i.status,
      building: i.buildingName,
      assignee: i.inspector,
    })),
    ...workOrders.filter(w => w.dueDate).map(w => ({
      id: w.id,
      title: w.title,
      date: w.dueDate,
      type: 'work-order',
      status: w.status,
      building: w.buildingName,
      assignee: w.assignedTo,
    })),
  ];

  const getEventsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter(e => e.date === dateStr);
  };

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
      {/* Calendar */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="sm" variant="ghost" icon={ChevronLeft} onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} />
            <Button size="sm" variant="secondary" onClick={() => setCurrentMonth(new Date())}>Today</Button>
            <Button size="sm" variant="ghost" icon={ChevronRight} onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} />
          </div>
        </div>

        {/* Day Headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, marginBottom: 4 }}>
          {dayNames.map(day => (
            <div key={day} style={{
              padding: '8px 0',
              textAlign: 'center',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
          {/* Empty cells for offset */}
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} style={{ minHeight: 80, padding: 4 }} />
          ))}

          {days.map(day => {
            const dayEvents = getEventsForDate(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const today = isToday(day);

            return (
              <motion.div
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                whileHover={{ backgroundColor: 'var(--bg-card-hover)' }}
                style={{
                  minHeight: 80,
                  padding: 6,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  border: isSelected ? '2px solid var(--color-fire-500)' : '1px solid transparent',
                  backgroundColor: isSelected ? 'var(--color-fire-50)' : 'transparent',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{
                  fontSize: '0.8125rem',
                  fontWeight: today ? 700 : 400,
                  color: today ? 'var(--color-fire-500)' : 'var(--text-primary)',
                  marginBottom: 4,
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  backgroundColor: today ? 'var(--color-fire-500)' : 'transparent',
                  ...(today ? { color: '#fff' } : {}),
                }}>
                  {format(day, 'd')}
                </div>
                {dayEvents.slice(0, 2).map(event => (
                  <div key={event.id} style={{
                    fontSize: '0.625rem',
                    fontWeight: 500,
                    padding: '1px 4px',
                    borderRadius: 3,
                    marginBottom: 2,
                    backgroundColor: event.type === 'inspection' ? 'var(--color-info-100)' : 'var(--color-warning-100)',
                    color: event.type === 'inspection' ? 'var(--color-info-600)' : 'var(--color-warning-600)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', paddingLeft: 4 }}>
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Sidebar - Selected Date Details */}
      <div>
        <Card>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 4 }}>
            {selectedDate ? format(selectedDate, 'EEEE, MMM d, yyyy') : 'Select a Date'}
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 16 }}>
            {selectedEvents.length > 0 ? `${selectedEvents.length} event(s)` : 'No events scheduled'}
          </p>

          {selectedEvents.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {selectedEvents.map(event => (
                <div key={event.id} style={{
                  padding: 12,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderLeft: `3px solid ${event.type === 'inspection' ? 'var(--color-info-500)' : 'var(--color-warning-500)'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    {event.type === 'inspection' ? (
                      <ClipboardCheck size={14} style={{ color: 'var(--color-info-500)' }} />
                    ) : (
                      <Wrench size={14} style={{ color: 'var(--color-warning-500)' }} />
                    )}
                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
                      {event.type === 'inspection' ? 'Inspection' : 'Work Order'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: 6 }}>
                    {event.title}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Building2 size={12} /> {event.building}
                    </div>
                    {event.assignee && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <User size={12} /> {event.assignee}
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <StatusBadge status={event.status} size="xs" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              padding: '32px 16px',
              textAlign: 'center',
              color: 'var(--text-tertiary)',
              fontSize: '0.8125rem',
            }}>
              {selectedDate ? 'No events on this date' : 'Click a day to see scheduled events'}
            </div>
          )}
        </Card>

        <div style={{ marginTop: 16 }}>
          <Card>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 12 }}>Legend</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem' }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: 'var(--color-info-100)', border: '1px solid var(--color-info-300)' }} />
                <span>Inspection</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem' }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: 'var(--color-warning-100)', border: '1px solid var(--color-warning-300)' }} />
                <span>Work Order</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
