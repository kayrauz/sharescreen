// Polyfills for Cloudflare Workers runtime
if (typeof MessageChannel === 'undefined') {
  globalThis.MessageChannel = class MessageChannel {
    constructor() {
      this.port1 = { postMessage: () => {}, onmessage: null, close: () => {} };
      this.port2 = { postMessage: () => {}, onmessage: null, close: () => {} };
    }
  };
}

if (typeof MessagePort === 'undefined') {
  globalThis.MessagePort = class MessagePort {
    postMessage() {}
    close() {}
  };
}