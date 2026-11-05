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
  scrollTop = 0;

  // Mistake 2: heavy work in a getter, re-run on every change detection
  // and called several times per pass from the template.
  get rows(): Order[] {
    const q = this.query.toLowerCase();
    return this.all
      .filter((o) => (!q || o.customer.toLowerCase().includes(q) || o.email.includes(q) || String(o.id).includes(q)) && (!this.status || o.status === this.status))
      .sort((a, b) => compareOrders(a, b, this.sortKey, this.sortDir));
  }

  // Mistake 3: a summary panel that re-reduces the whole list through the getter
  get totalSum(): number {
    return this.rows.reduce((sum, o) => sum + o.amount, 0);
  }
  get firstVisibleRow(): number {
    return Math.min(Math.floor(this.scrollTop / 40) + 1, this.rows.length);
  }

  // Mistake 4: expensive formatting called per cell from the template
  money(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }
  percent(o: Order): string {
    return new Intl.NumberFormat('en-US', { style: 'percent' }).format(o.discount / 100);
  }
  unitPrice(o: Order): string {
    return this.money(o.amount / (o.qty * (1 - o.discount / 100)));
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

  // Mistake 5: no debounce, filter runs on every keystroke
  onInput(): void {
    this.metrics.measureAction();
  }
  // Mistake 6: scroll handler that triggers a full change detection pass
  onScroll(event: Event): void {
    this.scrollTop = (event.target as HTMLElement).scrollTop;
  }
  sortBy(key: SortKey): void {
    this.metrics.measureAction();
    this.sortDir = this.sortKey === key && this.sortDir === 'asc' ? 'desc' : 'asc';
    this.sortKey = key;
  }
}
