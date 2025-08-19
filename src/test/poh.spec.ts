import { describe, it, expect } from 'vitest';
import { PoH } from '../core/poh';

describe('PoH', () => {
  it('produces deterministic ticks from seed', () => {
    const poh = PoH.fromSeed('00'.repeat(32));
    const a1 = poh.tick().current();
    const a2 = poh.tick().current();

    const poh2 = PoH.fromSeed('00'.repeat(32));
    poh2.tick();
    expect(poh2.current()).toBe(a1);
    poh2.tick();
    expect(poh2.current()).toBe(a2);
  });

  it('stamps data into the sequence', () => {
    const poh = PoH.fromSeed('11'.repeat(32));
    const before = poh.current();
    poh.stamp(Buffer.from('hello'));
    const after = poh.current();
    expect(after).not.toBe(before);
  });
});
