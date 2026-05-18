// XACT — line icon set (1.7px stroke, 20×20 viewBox)
const Icon = ({ d, size = 18, stroke = 1.7 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none"
    stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

const I = {
  // Dashboard — four-panel grid, balanced
  dash: <Icon d={<><rect x="2.75" y="2.75" width="6.5" height="6.5" rx="1.2"/><rect x="10.75" y="2.75" width="6.5" height="6.5" rx="1.2"/><rect x="2.75" y="10.75" width="6.5" height="6.5" rx="1.2"/><rect x="10.75" y="10.75" width="6.5" height="6.5" rx="1.2"/></>} />,
  // Estimates — clipboard with checked items
  estimate: <Icon d={<><rect x="4" y="3.5" width="12" height="13.5" rx="1.5"/><path d="M7.5 2.5h5a1 1 0 011 1V5a.5.5 0 01-.5.5h-6A.5.5 0 016.5 5V3.5a1 1 0 011-1z" fill="currentColor" opacity=".18"/><path d="M7.5 2.5h5a1 1 0 011 1V5h-7V3.5a1 1 0 011-1z"/><path d="M7 9.5l1.5 1.5L11 8.5M7 13.5h6"/></>} />,
  // Takeoff — floor plan / blueprint with measurement marks (much clearer than zigzag)
  takeoff: <Icon d={<><rect x="2.5" y="4.5" width="15" height="11" rx="1"/><path d="M8 4.5v4M8 8.5h4M12 8.5v7M2.5 11.5h5.5"/><circle cx="5" cy="7" r=".8" fill="currentColor"/><circle cx="14.5" cy="13" r=".8" fill="currentColor"/></>} />,
  // Pipeline — funnel
  pipeline: <Icon d={<><path d="M2.5 4h15l-5.5 7v5l-4 1.5V11L2.5 4z"/><path d="M6.5 7.5h7" opacity=".7"/></>} />,
  // Pricing — price tag with dot
  pricing: <Icon d={<><path d="M10.5 2.5h6a1 1 0 011 1v6L9.4 17.2a1 1 0 01-1.4 0L2.8 12a1 1 0 010-1.4L10.5 2.5z"/><circle cx="13.5" cy="6.5" r="1.2" fill="currentColor"/></>} />,
  // Analytics — ascending bars + line
  analytics: <Icon d={<><path d="M3 17V11M7.5 17V8M12 17V12M16.5 17V5"/><path d="M3 7l4-3 4 2 6-5" opacity=".55"/></>} />,
  team: <Icon d={<><circle cx="7" cy="8" r="3"/><path d="M2 17c0-2.8 2.2-5 5-5s5 2.2 5 5"/><circle cx="14" cy="7" r="2.5"/><path d="M18 14c0-2.2-1.8-4-4-4"/></>} />,
  map: <Icon d={<><path d="M7 3l-4 2v12l4-2 6 2 4-2V3l-4 2-6-2zM7 3v12M13 5v12"/></>} />,
  search: <Icon d={<><circle cx="9" cy="9" r="5.5"/><path d="M13.5 13.5L17 17"/></>} />,
  bell: <Icon d={<><path d="M5 14V9a5 5 0 0110 0v5l1.5 2h-13L5 14zM8 17a2 2 0 004 0"/></>} />,
  plus: <Icon d={<><path d="M10 4v12M4 10h12"/></>} />,
  filter: <Icon d={<><path d="M3 5h14l-5 7v4l-4 1v-5L3 5z"/></>} />,
  more: <Icon d={<><circle cx="5" cy="10" r=".7" fill="currentColor"/><circle cx="10" cy="10" r=".7" fill="currentColor"/><circle cx="15" cy="10" r=".7" fill="currentColor"/></>} />,
  arrow: <Icon d={<><path d="M5 10h10M11 6l4 4-4 4"/></>} />,
  arrowUp: <Icon d={<><path d="M5 12l5-5 5 5"/></>} />,
  arrowDown: <Icon d={<><path d="M5 8l5 5 5-5"/></>} />,
  check: <Icon d={<><path d="M4 10l4 4 8-9"/></>} />,
  x: <Icon d={<><path d="M5 5l10 10M15 5L5 15"/></>} />,
  spark: <Icon d={<><path d="M10 2l2 5 5 .5-3.5 3.5L15 17l-5-3-5 3 1.5-6L3 7.5 8 7l2-5z"/></>} />,
  bolt: <Icon d={<><path d="M11 2L4 12h5l-1 6 7-10h-5l1-6z"/></>} />,
  cmd: <Icon d={<><path d="M6 4h8a2 2 0 010 4h-8a2 2 0 010-4zM6 12h8a2 2 0 010 4h-8a2 2 0 010-4zM6 4v12M14 4v12"/></>} />,
  flame: <Icon d={<><path d="M10 18c-3 0-5-2-5-5 0-2 1-3 2-4 0 1 1 2 2 1 0-2-1-3 0-5 1-1 2-2 2-3 0 2 2 3 3 5s1 4 1 6c0 3-2 5-5 5z"/></>} />,
  building: <Icon d={<><rect x="3" y="3" width="14" height="14" rx="1"/><path d="M7 7v1M10 7v1M13 7v1M7 10v1M10 10v1M13 10v1M7 13v1M10 13v1M13 13v1"/></>} />,
  drop: <Icon d={<><path d="M10 2c-3 4-5 7-5 10a5 5 0 0010 0c0-3-2-6-5-10z"/></>} />,
  cube: <Icon d={<><path d="M10 3l6 3.5v7L10 17l-6-3.5v-7L10 3zM10 3v7M10 10l6-3.5M10 10L4 6.5"/></>} />,
  chevron: <Icon d={<><path d="M8 5l5 5-5 5"/></>} />,
  collapse: <Icon d={<><path d="M12 5l-5 5 5 5M16 5v10"/></>} />,
  settings: <Icon d={<><circle cx="10" cy="10" r="2.5"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.5 4.5l1.4 1.4M14.1 14.1l1.4 1.4M4.5 15.5l1.4-1.4M14.1 5.9l1.4-1.4"/></>} />,
  doc: <Icon d={<><path d="M5 2h7l4 4v12H5V2z"/><path d="M12 2v4h4M7 10h6M7 13h6M7 7h2"/></>} />,
  clock: <Icon d={<><circle cx="10" cy="10" r="7"/><path d="M10 6v4l3 2"/></>} />,
  layer: <Icon d={<><path d="M10 3l7 4-7 4-7-4 7-4zM3 11l7 4 7-4M3 15l7 4 7-4"/></>} />,
  trend: <Icon d={<><path d="M3 14l5-5 3 3 6-7"/><path d="M13 5h4v4"/></>} />,
};

window.XACT_ICONS = I;
