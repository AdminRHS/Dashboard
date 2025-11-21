(function registerPerfMetrics(global: Window & typeof globalThis) {
  type PerfMetrics = {
    fcp?: number;
    lcp?: number;
    cls: number;
    fid?: number;
  };

  const metrics: PerfMetrics = { cls: 0 };

  function withObserver(entryType: string, callback: (entry: PerformanceEntry) => void, opts?: PerformanceObserverInit): void {
    if (!('PerformanceObserver' in global)) {
      return;
    }
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(callback);
      });
      observer.observe({ type: entryType, buffered: true, ...opts });
    } catch (error) {
      console.warn(`PerformanceObserver for ${entryType} failed`, error);
    }
  }

  withObserver('paint', (entry) => {
    if (entry.name === 'first-contentful-paint') {
      metrics.fcp = entry.startTime;
    }
  });

  withObserver('largest-contentful-paint', (entry) => {
    metrics.lcp = entry.startTime;
  }, { durationThreshold: 0 });

  withObserver('layout-shift', (entry) => {
    const shift = entry as LayoutShift;
    if (!shift.hadRecentInput) {
      metrics.cls += shift.value;
    }
  });

  withObserver('first-input', (entry) => {
    const firstInput = entry as PerformanceEventTiming;
    metrics.fid = firstInput.processingStart - firstInput.startTime;
  }, { durationThreshold: 0 });

  global.getPerfMetrics = (): PerfMetrics => ({ ...metrics });
})(window);


