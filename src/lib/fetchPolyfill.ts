if (typeof window !== 'undefined' && window.fetch) {
  try {
    const desc = Object.getOwnPropertyDescriptor(window, 'fetch');
    if (!desc || !desc.set) {
      let currentFetch = window.fetch.bind(window);
      Object.defineProperty(window, 'fetch', {
        get() {
          return currentFetch;
        },
        set(fn) {
          currentFetch = fn;
        },
        configurable: true,
        enumerable: true,
      });
    }
  } catch (e) {
    // ignore
  }
}

export {};
