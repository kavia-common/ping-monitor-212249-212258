 /**
  * PUBLIC_INTERFACE
  * simulatePing emulates network latency/packet loss.
  * Options:
  *  - minMs: minimum latency
  *  - maxMs: maximum latency
  *  - lossRate: probability [0,1] of simulated timeout/loss
  * Returns a Promise that resolves with { ok: boolean, rtt: number, statusText: string }
  */
export function simulatePing({ minMs = 20, maxMs = 200, lossRate = 0.05 } = {}) {
  const range = Math.max(0, maxMs - minMs);
  const delay = Math.floor(minMs + Math.random() * (range || 1));
  const lost = Math.random() < lossRate;
  return new Promise((resolve) => {
    setTimeout(() => {
      if (lost) {
        resolve({ ok: false, rtt: delay, statusText: 'Simulated timeout' });
      } else {
        resolve({ ok: true, rtt: delay, statusText: 'Simulated OK' });
      }
    }, delay);
  });
}
