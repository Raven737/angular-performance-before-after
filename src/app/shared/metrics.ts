import { Injectable, signal } from '@angular/core';

/**
 * Measures real browser numbers: FPS (requestAnimationFrame),
 * DOM nodes inside the table, and time from an action to the next painted frame.
 */
@Injectable({ providedIn: 'root' })
export class MetricsService {
  readonly fps = signal(0);
  readonly domNodes = signal(0);
  readonly lastActionMs = signal<number | null>(null);

  private running = false;
  private frames = 0;
  private windowStart = 0;
  private tableSelector = '';

  start(tableSelector: string): void {
    this.tableSelector = tableSelector;
    if (this.running) return;
    this.running = true;
    this.frames = 0;
    this.windowStart = performance.now();
    const loop = (now: number) => {
      if (!this.running) return;
      this.frames++;
      if (now - this.windowStart >= 500) {
        this.fps.set(Math.round((this.frames * 1000) / (now - this.windowStart)));
        this.domNodes.set(document.querySelector(this.tableSelector)?.getElementsByTagName('*').length ?? 0);
        this.frames = 0;
        this.windowStart = now;
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  stop(): void {
    this.running = false;
  }

  /** Call right before a user action; resolves after the next paint. */
  measureAction(): void {
    const t0 = performance.now();
    requestAnimationFrame(() =>
      setTimeout(() => this.lastActionMs.set(Math.round(performance.now() - t0)), 0),
    );
  }
}
