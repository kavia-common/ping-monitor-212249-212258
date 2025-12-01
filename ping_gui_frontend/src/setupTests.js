// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';


// Mock Web Worker for Jest environment to avoid import.meta/new URL issues
class MockWorker {
  constructor() {
    this.onmessage = null;
    this.onerror = null;
  }
  postMessage() {}
  terminate() {}
}

// Provide a minimal global Worker if not present
if (typeof global.Worker === 'undefined') {
  // eslint-disable-next-line no-undef
  global.Worker = MockWorker;
}
