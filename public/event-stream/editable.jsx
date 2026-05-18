// XACT — Editable cells + Export/Import helpers
const { useState: useStateE, useEffect: useEffectE, useRef: useRefE } = React;

// ─── CSV / TSV / JSON / Markdown serializers ────────────────────────────────
const csvEscape = (v) => {
  const s = v == null ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const tsvEscape = (v) => (v == null ? '' : String(v).replace(/\t|\n|\r/g, ' '));

function toCSV(rows, cols) {
  const header = cols.map(c => csvEscape(c.label || c.k)).join(',');
  const body = rows.map(r => cols.map(c => csvEscape(r[c.k])).join(',')).join('\n');
  return header + '\n' + body + '\n';
}
function toTSV(rows, cols) {
  const header = cols.map(c => tsvEscape(c.label || c.k)).join('\t');
  const body = rows.map(r => cols.map(c => tsvEscape(r[c.k])).join('\t')).join('\n');
  return header + '\n' + body + '\n';
}
function toJSON(rows) { return JSON.stringify(rows, null, 2); }
function toMarkdown(rows, cols) {
  const sanitize = (v) => String(v ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
  const header = '| ' + cols.map(c => sanitize(c.label || c.k)).join(' | ') + ' |';
  const sep = '| ' + cols.map(c => (c.align === 'r' ? '---:' : '---')).join(' | ') + ' |';
  const body = rows.map(r => '| ' + cols.map(c => sanitize(r[c.k])).join(' | ') + ' |').join('\n');
  return [header, sep, body].join('\n');
}

// ─── Parsers ────────────────────────────────────────────────────────────────
function parseCSV(text, delim = ',') {
  const out = [];
  let row = [], cell = '', inQ = false, i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cell += '"'; i += 2; continue; }
        inQ = false; i++; continue;
      }
      cell += ch; i++; continue;
    }
    if (ch === '"') { inQ = true; i++; continue; }
    if (ch === delim) { row.push(cell); cell = ''; i++; continue; }
    if (ch === '\r') { i++; continue; }
    if (ch === '\n') { row.push(cell); out.push(row); row = []; cell = ''; i++; continue; }
    cell += ch; i++;
  }
  if (cell.length || row.length) { row.push(cell); out.push(row); }
  return out.filter(r => r.length && !(r.length === 1 && r[0] === ''));
}

function rowsFromTable(table, cols) {
  if (!table.length) return [];
  const header = table[0].map(s => String(s).trim().toLowerCase());
  const keyByIndex = header.map(h => {
    const c = cols.find(c => c.label.toLowerCase() === h || c.k.toLowerCase() === h);
    return c ? c.k : null;
  });
  return table.slice(1).map(r => {
    const obj = {};
    keyByIndex.forEach((k, i) => {
      if (!k) return;
      let v = r[i];
      const col = cols.find(c => c.k === k);
      if (col?.kind === 'num') {
        const n = parseFloat(String(v).replace(/[^0-9.\-]/g, ''));
        v = isNaN(n) ? 0 : n;
      }
      obj[k] = v;
    });
    return obj;
  }).filter(o => Object.keys(o).length);
}

function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime + ';charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.style.display = 'none';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

// ─── Editable cell ──────────────────────────────────────────────────────────
function EditableCell({ value, col, row, distinct, onChange, render, editing, onStartEdit, onEndEdit }) {
  const [val, setVal] = useStateE(value);
  const inputRef = useRefE(null);

  useEffectE(() => { setVal(value); }, [value, editing]);
  useEffectE(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current.select) inputRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    let v = val;
    if (col.kind === 'num') {
      const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.\-]/g, ''));
      v = isNaN(n) ? 0 : n;
    }
    if (v !== value) onChange(v);
    onEndEdit();
  };
  const cancel = () => { setVal(value); onEndEdit(); };

  if (!editing) {
    return (
      <div className="xc-cell-view" onDoubleClick={() => !col.readonly && onStartEdit()}>
        {render(value, row)}
      </div>
    );
  }

  const onKey = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); commit(); }
    else if (e.key === 'Escape') { e.preventDefault(); cancel(); }
    else if (e.key === 'Tab') { commit(); /* table-level handler can advance */ }
  };

  if (col.kind === 'enum' && distinct && distinct.length) {
    const opts = distinct.includes(val) ? distinct : [...distinct, val];
    return (
      <div className="xc-cell-edit-wrap">
        <select className="xc-cell-edit xc-cell-edit-sel" ref={inputRef}
          value={val ?? ''}
          onChange={e => setVal(e.target.value)}
          onBlur={commit} onKeyDown={onKey}>
          {opts.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }

  return (
    <div className="xc-cell-edit-wrap">
      <input className={`xc-cell-edit ${col.align === 'r' ? 'r' : ''}`} ref={inputRef}
        type={col.kind === 'num' ? 'number' : 'text'}
        value={val ?? ''}
        step={col.kind === 'num' ? 'any' : undefined}
        onChange={e => setVal(col.kind === 'num' ? e.target.value : e.target.value)}
        onBlur={commit} onKeyDown={onKey}/>
    </div>
  );
}

// ─── Export / Import button group ───────────────────────────────────────────
function ExportImportMenu({ rows, cols, onImport, filenameBase = 'export' }) {
  const [open, setOpen] = useStateE(null); // 'export' | 'import' | null
  const wrapRef = useRefE(null);
  const fileRef = useRefE(null);

  useEffectE(() => {
    const click = (e) => { if (!wrapRef.current?.contains(e.target)) setOpen(null); };
    document.addEventListener('mousedown', click);
    return () => document.removeEventListener('mousedown', click);
  }, []);

  const exportable = cols.filter(c => !c.hideExport);
  const stamp = new Date().toISOString().slice(0, 10);

  const doExport = (kind) => {
    const fn = `${filenameBase}-${stamp}`;
    if (kind === 'csv')   downloadFile(`${fn}.csv`,  toCSV(rows, exportable),       'text/csv');
    if (kind === 'tsv')   downloadFile(`${fn}.tsv`,  toTSV(rows, exportable),       'text/tab-separated-values');
    if (kind === 'xls')   downloadFile(`${fn}.xls`,  toTSV(rows, exportable),       'application/vnd.ms-excel');
    if (kind === 'json')  downloadFile(`${fn}.json`, toJSON(rows),                  'application/json');
    if (kind === 'md')    downloadFile(`${fn}.md`,   toMarkdown(rows, exportable),  'text/markdown');
    if (kind === 'copy')  navigator.clipboard?.writeText(toTSV(rows, exportable));
    if (kind === 'print') {
      const w = window.open('', '_blank');
      const html = `<html><head><title>${filenameBase}</title><style>
        body{font:12px/1.4 system-ui;padding:24px}
        table{border-collapse:collapse;width:100%}
        th,td{border:1px solid #ddd;padding:6px 10px;text-align:left}
        th{background:#f4f1ea}
      </style></head><body><h2>${filenameBase} · ${stamp}</h2><table><thead><tr>${
        exportable.map(c => `<th>${c.label}</th>`).join('')
      }</tr></thead><tbody>${
        rows.map(r => `<tr>${exportable.map(c => `<td>${r[c.k] ?? ''}</td>`).join('')}</tr>`).join('')
      }</tbody></table></body></html>`;
      w.document.write(html); w.document.close(); setTimeout(() => w.print(), 200);
    }
    setOpen(null);
  };

  const handleFile = async (file, mode) => {
    const text = await file.text();
    let parsed = [];
    try {
      if (file.name.endsWith('.json') || text.trim().startsWith('[')) {
        const arr = JSON.parse(text);
        if (Array.isArray(arr)) parsed = arr;
      } else {
        const delim = file.name.endsWith('.tsv') || text.includes('\t') ? '\t' : ',';
        const table = parseCSV(text, delim);
        parsed = rowsFromTable(table, cols);
      }
    } catch (err) {
      alert('Could not parse file: ' + err.message);
      return;
    }
    if (parsed.length === 0) {
      alert('No rows found in file.');
      return;
    }
    onImport(parsed, mode);
    setOpen(null);
  };

  return (
    <div className="xc-impexp" ref={wrapRef}>
      <input ref={fileRef} type="file" accept=".csv,.tsv,.json,.txt"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          const mode = fileRef.current.dataset.mode || 'append';
          if (f) handleFile(f, mode);
          e.target.value = '';
        }}/>

      <button className={`xc-chip ${open === 'import' ? 'active' : ''}`}
        onClick={() => setOpen(o => o === 'import' ? null : 'import')}>
        <svg width="11" height="11" viewBox="0 0 12 12"><path d="M6 1v7m0 0L3 5m3 3l3-3M1 10h10" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round"/></svg>
        Import
      </button>
      <button className={`xc-chip ${open === 'export' ? 'active' : ''}`}
        onClick={() => setOpen(o => o === 'export' ? null : 'export')}>
        <svg width="11" height="11" viewBox="0 0 12 12"><path d="M6 11V4m0 0L3 7m3-3l3 3M1 1h10" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round"/></svg>
        Export
      </button>

      {open === 'export' && (
        <div className="xc-impexp-pop">
          <div className="xc-impexp-grp">EXPORT · {rows.length} rows</div>
          <button className="xc-impexp-item" onClick={() => doExport('csv')}>
            <span className="xc-impexp-ext">.csv</span>
            <span><b>CSV</b><small>Comma-separated values</small></span>
          </button>
          <button className="xc-impexp-item" onClick={() => doExport('tsv')}>
            <span className="xc-impexp-ext">.tsv</span>
            <span><b>TSV</b><small>Tab-separated · paste into Sheets</small></span>
          </button>
          <button className="xc-impexp-item" onClick={() => doExport('xls')}>
            <span className="xc-impexp-ext">.xls</span>
            <span><b>Excel</b><small>Opens in Excel / Numbers</small></span>
          </button>
          <button className="xc-impexp-item" onClick={() => doExport('json')}>
            <span className="xc-impexp-ext">.json</span>
            <span><b>JSON</b><small>Structured data</small></span>
          </button>
          <button className="xc-impexp-item" onClick={() => doExport('md')}>
            <span className="xc-impexp-ext">.md</span>
            <span><b>Markdown</b><small>Table in Markdown syntax</small></span>
          </button>
          <div className="xc-impexp-sep"/>
          <button className="xc-impexp-item" onClick={() => doExport('copy')}>
            <span className="xc-impexp-ext xc-impexp-ico">⧉</span>
            <span><b>Copy to clipboard</b><small>Paste anywhere as TSV</small></span>
          </button>
          <button className="xc-impexp-item" onClick={() => doExport('print')}>
            <span className="xc-impexp-ext xc-impexp-ico">⎙</span>
            <span><b>Print / PDF</b><small>Open printable view</small></span>
          </button>
        </div>
      )}

      {open === 'import' && (
        <div className="xc-impexp-pop">
          <div className="xc-impexp-grp">IMPORT</div>
          <button className="xc-impexp-item" onClick={() => { fileRef.current.dataset.mode = 'append'; fileRef.current.click(); }}>
            <span className="xc-impexp-ext">+</span>
            <span><b>Append rows</b><small>Add to existing data</small></span>
          </button>
          <button className="xc-impexp-item" onClick={() => { fileRef.current.dataset.mode = 'replace'; fileRef.current.click(); }}>
            <span className="xc-impexp-ext">⟳</span>
            <span><b>Replace all rows</b><small>Wipes current table</small></span>
          </button>
          <button className="xc-impexp-item" onClick={() => { fileRef.current.dataset.mode = 'merge'; fileRef.current.click(); }}>
            <span className="xc-impexp-ext">≡</span>
            <span><b>Merge by ID</b><small>Update rows with matching ID</small></span>
          </button>
          <div className="xc-impexp-sep"/>
          <div className="xc-impexp-hint">Accepts .csv · .tsv · .json — header row required for CSV/TSV.</div>
        </div>
      )}
    </div>
  );
}

window.XACT_EDIT = { EditableCell, ExportImportMenu, toCSV, toTSV, toJSON, toMarkdown, parseCSV, rowsFromTable, downloadFile };
