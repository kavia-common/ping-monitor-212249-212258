 /* eslint-disable no-restricted-globals */
import { simulatePing } from '../utils/pingSimulator';

/**
 * PUBLIC_INTERFACE
 * WebWorker script that performs repeated "ping" operations.
 * Modes:
 *  - http: performs fetch() with HEAD/GET and times RTT; uses AbortController for timeout.
 *  - simulate: uses a latency simulator for environments where HTTP isn't desired.
 *
 * Messages:
 *  - { type: 'start', payload: { target, mode: 'http'|'simulate', method: 'HEAD'|'GET', intervalMs, timeoutMs } }
 *  - { type: 'stop' }
 * Events emitted to main thread:
 *  - { type: 'log', payload: { level, message } }
 *  - { type: 'result', payload: { level, message } }
 *  - { type: 'stopped' }
 */
let timer = null;
let running = false;

function post(level, message, eventType = 'log') {
  postMessage({ type: eventType, payload: { level, message } });
}

function clearTimer() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

async function httpPing(target, method, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort('timeout'), timeoutMs);
  const started = performance.now();
  try {
    const res = await fetch(target, { method, cache: 'no-store', mode: 'no-cors', signal: controller.signal });
    const ended = performance.now();
    const rtt = Math.round(ended - started);
    // Since no-cors may yield opaque response, consider it reachable if no exception
    const ok = res?.ok !== false;
    return { ok, rtt, statusText: res?.statusText || 'OK' };
  } catch (err) {
    const ended = performance.now();
    const rtt = Math.round(ended - started);
    return { ok: false, rtt, statusText: err?.message || 'Error' };
  } finally {
    clearTimeout(timeout);
  }
}

function loopOnce(config) {
  const { target, mode, method, timeoutMs } = config;
  const doOne = async () => {
    if (!running) return;
    try {
      let result;
      if (mode === 'simulate') {
        result = await simulatePing({});
      } else {
        result = await httpPing(target, method, timeoutMs);
      }
      const msg = `${mode.toUpperCase()} ${result.ok ? 'OK' : 'FAIL'} ${result.rtt}ms${result.statusText ? ` - ${result.statusText}` : ''}`;
      post(result.ok ? 'info' : 'error', msg, 'result');
    } catch (e) {
      post('error', `Error: ${e?.message || e}`);
    }
  };
  doOne();
}

function schedule(config) {
  clearTimer();
  timer = setTimeout(() => {
    if (!running) return;
    loopOnce(config);
    schedule(config);
  }, config.intervalMs);
}

self.onmessage = (e) => {
  const { type, payload } = e.data || {};
  if (type === 'start') {
    if (running) {
      post('warn', 'Already running; restarting with new config.');
      running = false;
      clearTimer();
    }
    const { target, mode, method, intervalMs, timeoutMs } = payload || {};
    running = true;
    post('info', `Worker started: ${mode} -> ${target}`);
    loopOnce({ target, mode, method, intervalMs, timeoutMs });
    schedule({ target, mode, method, intervalMs, timeoutMs });
  } else if (type === 'stop') {
    running = false;
    clearTimer();
    post('info', 'Worker stop received.');
    postMessage({ type: 'stopped' });
  }
};
