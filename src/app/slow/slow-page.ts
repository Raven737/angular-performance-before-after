import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MetricsBar } from '../shared/metrics-bar';
import { MetricsService } from '../shared/metrics';
import { Order, OrderStatus, STATUSES, SortDir, SortKey, compareOrders, generateOrders } from '../shared/order';

/**
 * THE "BEFORE" VERSION. Every pattern below is a mistake seen in real projects.
 * Do not copy it. The optimized page next to it fixes each one.
 */
@Component({
  selector: 'app-slow-page',
  imports: [FormsModule, MetricsBar],
  templateUrl: './slow-page.html',
})
export class SlowPage implements OnInit, OnDestroy {
  protected metrics = inject(MetricsService);
  protected statuses = STATUSES;

  // Mistake 1: plain fields instead of signals
  all: Order[] = generateOrders(10_000);
  query = '';
  status: OrderStatus | '' = '';
  sortKey: SortKey = 'id';
  sortDir: SortDir = 'asc';

  // Mistake 2: heavy work in a getter, re-run on every change detection
  // and called several times per pass from the template.
  get rows(): Order[] {
    const q = this.query.toLowerCase();
    return this.all
      .filter((o) => (!q || o.customer.toLowerCase().includes(q) || String(o.id).includes(q)) && (!this.status || o.status === this.status))
      .sort((a, b) => compareOrders(a, b, this.sortKey, this.sortDir));
  }

  // Mistake 3: expensive formatting called per row from the template
  fmtAmount(o: Order): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(o.amount);
  }
  fmtDate(o: Order): string {
    return new Date(o.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' });
  }

  ngOnInit(): void {
    this.metrics.start('.table-body');
  }
  ngOnDestroy(): void {
    this.metrics.stop();
  }

  // Mistake 4: no debounce, filter runs on every keystroke
  onInput(): void {
    this.metrics.measureAction();
  }
  sortBy(key: SortKey): void {
    this.metrics.measureAction();
    this.sortDir = this.sortKey === key && this.sortDir === 'asc' ? 'desc' : 'asc';
    this.sortKey = key;
  }
}
