import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MetricsService } from './metrics';

@Component({
  selector: 'app-metrics-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="metrics">
      <div class="metric"><span class="label">FPS</span><b [class.bad]="m.fps() < 30" [class.good]="m.fps() >= 50">{{ m.fps() }}</b></div>
      <div class="metric"><span class="label">DOM nodes in table</span><b>{{ m.domNodes() }}</b></div>
      <div class="metric"><span class="label">Last action to paint</span><b>{{ m.lastActionMs() === null ? '-' : m.lastActionMs() + ' ms' }}</b></div>
    </div>
  `,
})
export class MetricsBar {
  protected readonly m = inject(MetricsService);
}
