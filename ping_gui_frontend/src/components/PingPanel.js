import React, { useMemo, useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * PingPanel renders inputs to configure a ping session and Start/Stop controls.
 * Props:
 *  - disabled: boolean (disables inputs when a session is running)
 *  - running: boolean (true when a session is running)
 *  - onStart(config): function, called with { target, mode, method, intervalMs, timeoutMs }
 *  - onStop(): function, called to stop the session
 */
function PingPanel({ disabled = false, running = false, onStart, onStop }) {
  const [target, setTarget] = useState('https://example.com');
  const [mode, setMode] = useState('http'); // 'http' | 'simulate'
  const [method, setMethod] = useState('HEAD'); // HEAD | GET
  const [intervalMs, setIntervalMs] = useState(1000);
  const [timeoutMs, setTimeoutMs] = useState(3000);

  const valid = useMemo(() => {
    if (!target || String(target).trim().length < 1) return false;
    if (mode === 'http') {
      try { new URL(target); } catch { return false; }
    }
    return intervalMs >= 200 && timeoutMs >= 300;
  }, [target, intervalMs, timeoutMs, mode]);

  const startHandler = () => {
    if (!valid) return;
    onStart?.({ target: target.trim(), mode, method, intervalMs: Number(intervalMs), timeoutMs: Number(timeoutMs) });
  };

  const stopHandler = () => onStop?.();

  return (
    <div>
      <div className="form-grid">
        <div className="form-row" style={{ gridColumn: '1 / -1' }}>
          <label className="label" htmlFor="target">IP / Hostname / URL</label>
          <input
            id="target"
            className="input"
            type="text"
            placeholder="e.g., https://example.com or 8.8.8.8"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            disabled={disabled}
          />
          <div className="helper">HTTP mode requires a full URL (https://...). Simulation mode accepts any text and generates synthetic latency.</div>
        </div>

        <div className="form-row">
          <label className="label" htmlFor="mode">Mode</label>
          <select id="mode" className="select" value={mode} onChange={(e) => setMode(e.target.value)} disabled={disabled}>
            <option value="http">HTTP Reachability</option>
            <option value="simulate">Simulation</option>
          </select>
        </div>

        <div className="form-row">
          <label className="label" htmlFor="method">HTTP Method</label>
          <select
            id="method"
            className="select"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            disabled={disabled || mode !== 'http'}
          >
            <option value="HEAD">HEAD</option>
            <option value="GET">GET</option>
          </select>
        </div>

        <div className="form-row">
          <label className="label" htmlFor="interval">Interval (ms)</label>
          <input
            id="interval"
            className="input"
            type="number"
            min="200"
            step="100"
            value={intervalMs}
            onChange={(e) => setIntervalMs(e.target.value)}
            disabled={disabled}
          />
        </div>

        <div className="form-row">
          <label className="label" htmlFor="timeout">Timeout (ms)</label>
          <input
            id="timeout"
            className="input"
            type="number"
            min="300"
            step="100"
            value={timeoutMs}
            onChange={(e) => setTimeoutMs(e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="actions">
        <button className="btn btn-primary" onClick={startHandler} disabled={!valid || running}>
          ▶ Start
        </button>
        <button className="btn btn-danger" onClick={stopHandler} disabled={!running}>
          ■ Stop
        </button>
      </div>
    </div>
  );
}

export default PingPanel;
