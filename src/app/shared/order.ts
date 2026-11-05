export type OrderStatus = 'new' | 'paid' | 'shipped' | 'cancelled';

export interface Order {
  id: number;
  customer: string;
  amount: number;
  status: OrderStatus;
  date: number; // timestamp
}

export const STATUSES: OrderStatus[] = ['new', 'paid', 'shipped', 'cancelled'];
export type SortKey = 'id' | 'customer' | 'amount' | 'date';
export type SortDir = 'asc' | 'desc';

const FIRST = ['Olena', 'Andrii', 'Maria', 'Taras', 'Iryna', 'Pavlo', 'Sofia', 'Dmytro', 'Kateryna', 'Oleh'];
const LAST = ['Kovalenko', 'Bondar', 'Shevchuk', 'Melnyk', 'Tkachenko', 'Kravets', 'Lysenko', 'Moroz'];

/** Deterministic generator, so both pages show identical data. */
export function generateOrders(count: number): Order[] {
  let seed = 42;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const start = Date.UTC(2025, 0, 1);
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    customer: `${FIRST[Math.floor(rnd() * FIRST.length)]} ${LAST[Math.floor(rnd() * LAST.length)]}`,
    amount: Math.round(rnd() * 250000) / 100,
    status: STATUSES[Math.floor(rnd() * STATUSES.length)],
    date: start + Math.floor(rnd() * 365 * 86400000),
  }));
}

export function compareOrders(a: Order, b: Order, key: SortKey, dir: SortDir): number {
  const x = a[key];
  const y = b[key];
  const r = typeof x === 'string' ? x.localeCompare(y as string) : (x as number) - (y as number);
  return dir === 'asc' ? r : -r;
}
