import { describe, expect, it } from 'vitest';
import { compareOrders, generateOrders } from './order';

describe('orders data', () => {
  it('generates the requested number of deterministic rows', () => {
    const a = generateOrders(1000);
    const b = generateOrders(1000);
    expect(a.length).toBe(1000);
    expect(a[10]).toEqual(b[10]);
  });

  it('sorts by amount in both directions', () => {
    const rows = generateOrders(50);
    const asc = [...rows].sort((x, y) => compareOrders(x, y, 'amount', 'asc'));
    const desc = [...rows].sort((x, y) => compareOrders(x, y, 'amount', 'desc'));
    expect(asc[0].amount).toBeLessThanOrEqual(asc[49].amount);
    expect(desc[0].amount).toBeGreaterThanOrEqual(desc[49].amount);
  });
});
