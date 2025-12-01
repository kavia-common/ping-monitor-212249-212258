# Ping GUI (React)

A lightweight, modern React app that provides a "ping-like" experience in the browser with real-time logs, start/stop controls, and an Ocean Professional theme.

## Important Note: ICMP Is Not Available in Browsers

Web browsers cannot send real ICMP echo requests. This application offers two modes:

- HTTP Reachability: Uses fetch() with HEAD or GET to measure round-trip time to a URL. This is not true ICMP ping but is useful for reachability/latency approximation.
- Simulation: Generates synthetic latency and occasional timeouts to demonstrate the UI and logging without any network calls.

## Features

- IP/Hostname/URL input, interval and timeout settings
- Mode selection: HTTP (HEAD/GET) or Simulation
- Start/Stop controls
- Real-time log viewer with auto-scroll
- Export logs to a text file
- Clear logs
- Ocean Professional theme (blue + amber accents), dark mode toggle
- REACT_APP_LOG_LEVEL supported: debug | info | warn | error

## Usage

1. Install dependencies and start:
   - npm install
   - npm start
2. Enter a target:
   - For HTTP mode, provide a full URL: e.g., https://example.com
   - For Simulation mode, any text is fine.
3. Choose method (HEAD/GET) for HTTP mode, set interval (ms) and timeout (ms).
4. Click Start to begin. Click Stop to end the session.
5. Use the Logs panel to Export or Clear entries.

## Environment Variables

- REACT_APP_LOG_LEVEL: Controls console verbosity. One of: debug, info, warn, error. Default: info.

## Tech Notes

- HTTP pings are implemented via a Web Worker (src/workers/pingWorker.js). Each iteration performs a fetch() with AbortController for timeouts and posts results back to the main thread.
- Simulation mode uses src/utils/pingSimulator.js to emulate latency and packet loss.
- The UI is composed of:
  - src/components/PingPanel.js for controls
  - src/components/LogViewer.js for real-time logs

## Scripts

- npm start: Start dev server
- npm test: Run tests
- npm run build: Production build

