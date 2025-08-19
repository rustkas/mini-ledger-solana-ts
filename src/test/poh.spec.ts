import { describe, it, expect } from 'vitest';
import { PoH } from '../core/poh';

describe('PoH', () => {
  it('produces deterministic ticks from seed', () => {
    /**
     * создаём PoH из фиксированного seed (32 байта нулей),
     * два раза делаем tick() (шаг: hash от текущего состояния),
     * получаем два разных значения (a1, a2).
     */
    const poh = PoH.fromSeed('00'.repeat(32));
    const a1 = poh.tick().current();
    const a2 = poh.tick().current();

    /**
     * создаём второй PoH с тем же seed,
     * делаем столько же тиков и проверяем, что состояния совпадают.
     * 👉 Проверка: последовательность хэшей детерминирована (зависит только от seed и числа шагов).
     */
    const poh2 = PoH.fromSeed('00'.repeat(32));
    poh2.tick();
    expect(poh2.current()).toBe(a1);
    poh2.tick();
    expect(poh2.current()).toBe(a2);
  });

  it('stamps data into the sequence', () => {

    /**
     * создаём PoH с другим seed,
     * сохраняем текущее состояние,
     * «вплетаем» данные (hello) в последовательность (stamp),
     * проверяем, что состояние изменилось.
     * 👉 Проверка: при добавлении данных PoH меняется.
     */
    const poh = PoH.fromSeed('11'.repeat(32));
    const before = poh.current();
    poh.stamp(Buffer.from('hello'));
    const after = poh.current();
    expect(after).not.toBe(before);
  });
});
