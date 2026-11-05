import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MetricsBar } from '../shared/metrics-bar';
import { MetricsService } from '../shared/metrics';
import { Order, OrderStatus, STATUSES, SortDir, SortKey, compareOrders, generateOrders } from '../shared/order';

const AMOUNT = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const PERCENT = new Intl.NumberFormat('en-US', { style: 'percent' });
const DATE = new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'short', day: '2-digit' });

/** THE "AFTER" VERSION: same data, same UI, fixes for each mistake on the slow page. */
@Component({
  selector: 'app-optimized-page',
  imports: [ScrollingModule, MetricsBar],
  changeDetection: ChangeDetectionStrategy.OnPush, // fix 1: OnPush + signals
  templateUrl: './optimized-page.html',
})
export class OptimizedPage implements OnInit, OnDestroy {
  protected metrics = inject(MetricsService);
  protected statuses = STATUSES;
  readonly rowHeight = 40;

  // fix 1: pre-formatted once, not per change detection
  private readonly all: ReadonlyArray<Order & { amountText: string; unitText: string; discountText: string; dateText: string }> =
    generateOrders(10_000).map((o) => ({
      ...o,
      amountText: AMOUNT.format(o.amount),
      unitText: AMOUNT.format(o.amount / (o.qty * (1 - o.discount / 100))),
      discountText: PERCENT.format(o.discount / 100),
      dateText: DATE.format(o.date),
    }));
  readonly total = this.all.length;

  readonly query = signal('');
  readonly status = signal<OrderStatus | ''>('');
  readonly sortKey = signal<SortKey>('id');
  readonly sortDir = signal<SortDir>('asc');

  // fix 2: computed runs only when its inputs change, result is cached
  readonly rows = computed(() => {
    const q = this.query().toLowerCase();
    const st = this.status();
    const key = this.sortKey();
    const dir = this.sortDir();
    return this.all
      .filter((o) => (!q || o.customer.toLowerCase().includes(q) || o.email.includes(q) || String(o.id).includes(q)) && (!st || o.status === st))
      .sort((a, b) => compareOrders(a, b, key, dir));
  });

  // fix: totals and scroll position are signals, nothing is recomputed on scroll
  readonly totalText = computed(() => AMOUNT.format(this.rows().reduce((sum, o) => sum + o.amount, 0)));
  readonly firstVisibleRow = signal(1);

  private timer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.metrics.start('.table-body');
  }
  ngOnDestroy(): void {
    this.metrics.stop();
    clearTimeout(this.timer);
  }

  // fix 3: debounce the search input
  onSearch(value: string): void {
    this.metrics.measureAction();
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.query.set(value), 200);
  }
  onStatus(value: string): void {
    this.metrics.measureAction();
    this.status.set(value as OrderStatus | '');
  }
  sortBy(key: SortKey): void {
    this.metrics.measureAction();
    this.sortDir.set(this.sortKey() === key && this.sortDir() === 'asc' ? 'desc' : 'asc');
    this.sortKey.set(key);
  }
  onScrolledIndex(index: number): void {
    this.firstVisibleRow.set(index + 1);
  }
  trackById = (_: number, o: Order) => o.id; // fix 4: stable identity
}
