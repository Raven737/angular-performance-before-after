export type OrderStatus = 'new' | 'paid' | 'shipped' | 'cancelled';

export interface Order {
  id: number;
  customer: string;
  email: string;
  city: string;
  product: string;
  qty: number;
  discount: number; // percent
  amount: number; // order total
  status: OrderStatus;
  date: number; // timestamp
}

export const STATUSES: OrderStatus[] = ['new', 'paid', 'shipped', 'cancelled'];
export type SortKey = 'id' | 'customer' | 'city' | 'product' | 'qty' | 'discount' | 'amount' | 'date';
export type SortDir = 'asc' | 'desc';

const FIRST = ['Olena', 'Andrii', 'Maria', 'Taras', 'Iryna', 'Pavlo', 'Sofia', 'Dmytro', 'Kateryna', 'Oleh'];
const CITIES = ['Kyiv', 'Lviv', 'Odesa', 'Kharkiv', 'Dnipro', 'Poltava', 'Vinnytsia', 'Chernihiv'];
const PRODUCTS = ['Laptop stand', 'Mechanical keyboard', 'USB-C hub', 'Monitor 27in', 'Webcam HD', 'Desk lamp', 'Headphones', 'Mouse pad XL'];
const LAST = ['Kovalenko', 'Bondar', 'Shevchuk', 'Melnyk', 'Tkachenko', 'Kravets', 'Lysenko', 'Moroz'];

/** Deterministic generator, so both pages show identical data. */
export function generateOrders(count: number): Order[] {
  let seed = 42;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const start = Date.UTC(2025, 0, 1);
  return Array.from({ length: count }, (_, i) => {
    const first = FIRST[Math.floor(rnd() * FIRST.length)];
    const last = LAST[Math.floor(rnd() * LAST.length)];
    const qty = 1 + Math.floor(rnd() * 9);
    const discount = Math.floor(rnd() * 31);
    return {
      id: i + 1,
      customer: `${first} ${last}`,
      email: `${first}.${last}${i + 1}@example.com`.toLowerCase(),
      city: CITIES[Math.floor(rnd() * CITIES.length)],
      product: PRODUCTS[Math.floor(rnd() * PRODUCTS.length)],
      qty,
      discount,
      amount: Math.round(qty * (10 + rnd() * 490) * (1 - discount / 100) * 100) / 100,
      status: STATUSES[Math.floor(rnd() * STATUSES.length)],
      date: start + Math.floor(rnd() * 365 * 86400000),
    };
  });
}

export function compareOrders(a: Order, b: Order, key: SortKey, dir: SortDir): number {
  const x = a[key];
  const y = b[key];
  const r = typeof x === 'string' ? x.localeCompare(y as string) : (x as number) - (y as number);
  return dir === 'asc' ? r : -r;
}
