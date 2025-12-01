import React, { useEffect, useMemo, useRef } from 'react';

/**
 * PUBLIC_INTERFACE
 * LogViewer displays real-time logs with auto-scroll, export, and clear controls.
 * Props:
 *  - logs: Array<{ ts: string, level: 'debug'|'info'|'warn'|'error', message: string, [extra...] }>
 *  - onClear(): function to clear the log list
 */
function LogViewer({ logs = [], onClear }) {
  const containerRef = useRef(null);

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [logs]);

  const content = useMemo(
    () =>
      logs
        .map((l) => {
          const base = `[${l.ts}] [${(l.level || 'info').toUpperCase()}] ${l.message || ''}`;
          return base;
        })
        .join('\n'),
    [logs]
  );

  const exportLogs = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const date = new Date().toISOString().replace(/[:.]/g, '-');
    a.download = `ping-logs-${date}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="log-toolbar">
        <div className="title">Logs</div>
        <div className="log-actions">
          <button className="btn" onClick={exportLogs} aria-label="Export logs">
            ⬇ Export
          </button>
          <button className="btn" onClick={onClear} aria-label="Clear logs">
            🧹 Clear
          </button>
        </div>
      </div>
      <div ref={containerRef} className="log-container" role="log" aria-live="polite">
        {logs.map((l, idx) => (
          <div key={idx} className="log-line">
            <span className={`badge ${l.level === 'error' ? 'error' : l.level === 'warn' ? 'warn' : l.level === 'debug' ? '' : 'success'}`}>
              {(l.level || 'info').toUpperCase()}
            </span>
            <span>{l.ts}</span>
            <span>-</span>
            <span>{l.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LogViewer;
