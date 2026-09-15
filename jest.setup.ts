import "@testing-library/jest-dom";

// jsdom does not implement IntersectionObserver. Without a stub, next/link's
// internal useIntersection hook falls back to a requestIdleCallback polyfill
// (a 1ms setTimeout) that calls setVisible(true) on every mounted <Link>.
// Under Jest fake timers those callbacks fire whenever tests advance timers
// outside act(), producing warnings like:
//   "An update to ForwardRef(LinkComponent) inside a test was not wrapped in
//    act(...)"
// A no-op observer keeps useIntersection on the real-observer code path
// (whose callback never fires in jsdom), so <Link> never schedules those
// state updates during tests.
if (typeof globalThis.IntersectionObserver === "undefined") {
  class IntersectionObserverStub {
    readonly root: Element | Document | null = null;
    readonly rootMargin: string = "";
    readonly thresholds: ReadonlyArray<number> = [];
    disconnect(): void {}
    observe(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
    unobserve(): void {}
  }
  (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
    IntersectionObserverStub;
}
