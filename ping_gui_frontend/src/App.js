import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import PingPanel from './components/PingPanel';
import LogViewer from './components/LogViewer';

/**
 * PUBLIC_INTERFACE
 * App is the entry component for the Ping GUI.
 * It renders the PingPanel (controls) and LogViewer (real-time logs) with a theme toggle.
 * Environment:
 *  - REACT_APP_LOG_LEVEL controls console verbosity: "debug" | "info" | "warn" | "error"
 */
function App() {
  const [theme, setTheme] = useState('light');
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const workerRef = useRef(null);

  // honor log level
  const logLevel = (process.env.REACT_APP_LOG_LEVEL || 'info').toLowerCase();
  const log = useMemo(() => {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentIdx = levels.indexOf(levels.includes(logLevel) ? logLevel : 'info');
    return {
      debug: (...a) => currentIdx <= 0 && console.debug('[DEBUG]', ...a),
      info: (...a) => currentIdx <= 1 && console.info('[INFO]', ...a),
      warn: (...a) => currentIdx <= 2 && console.warn('[WARN]', ...a),
      error: (...a) => currentIdx <= 3 && console.error('[ERROR]', ...a),
    };
  }, [logLevel]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const pushLog = (entry) => {
    setLogs((prev) => {
      const next = [...prev, { ts: new Date().toISOString(), ...entry }];
      return next.slice(-5000); // cap
    });
  };

  // Start worker with configuration
  const start = (config) => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    // PUBLIC_INTERFACE - create web worker
    const worker = typeof Worker !== 'undefined' ? new Worker('/pingWorker.js') : { postMessage: () => {}, terminate: () => {} };
    workerRef.current = worker;

    worker.onmessage = (e) => {
      const { type, payload } = e.data || {};
      if (type === 'log') pushLog(payload);
      if (type === 'result') pushLog(payload);
      if (type === 'stopped') {
        setIsRunning(false);
        pushLog({ level: 'info', message: 'Ping session stopped.' });
      }
    };
    worker.onerror = (err) => {
      log.error('Worker error:', err.message);
      pushLog({ level: 'error', message: `Worker error: ${err.message}` });
      setIsRunning(false);
    };

    worker.postMessage({ type: 'start', payload: config });
    setIsRunning(true);
    pushLog({ level: 'info', message: `Started ${config.mode} to ${config.target} (interval=${config.intervalMs}ms, timeout=${config.timeoutMs}ms)` });
  };

  // PUBLIC_INTERFACE - stop worker
  const stop = () => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'stop' });
      workerRef.current.terminate();
      workerRef.current = null;
    }
    setIsRunning(false);
    pushLog({ level: 'info', message: 'Stop requested by user.' });
  };

  const clearLogs = () => setLogs([]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <div className="App">
      <div className="app-container">
        <div className="header">
          <div className="brand">
            <div className="logo" />
            <div className="title">Ping Monitor (HTTP/Sim)</div>
          </div>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>

        <div className="main">
          <div className="card">
            <PingPanel
              disabled={isRunning}
              onStart={start}
              onStop={stop}
              running={isRunning}
            />
          </div>
          <div className="card">
            <LogViewer
              logs={logs}
              onClear={clearLogs}
            />
          </div>
        </div>

        <div className="footer">
          Note: Browsers cannot perform ICMP pings; HTTP reachability and simulation modes are provided.
        </div>
      </div>
    </div>
  );
}

export default App;
