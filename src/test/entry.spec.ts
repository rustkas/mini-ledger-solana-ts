import { describe, it, expect } from 'vitest';
import { PoH } from '../core/poh';
import { buildEntry } from '../core/entry';

describe('Entry', () => {
  it('builds an entry with N ticks and computes endHash', () => {
    /**
     * гарантирует, что buildEntry действительно «прокручивает» PoH на ticks шагов и 
     * корректно фиксирует границы Entry (начальный/конечный хэши).
     */
    /**
     * создаём детерминированный генератор PoH из фиксированного seed,
     * собираем Entry: делаем 5 тиков и не вплетаем событий.
     */
    const poh = PoH.fromSeed('aa'.repeat(32));
    const entry = buildEntry(poh, 5, []); // 5 тиков, без событий

    // проверяем, что в Entry отражено нужное число тиков.
    expect(entry.ticks).toBe(5);
    // убеждаемся, что список событий пуст
    expect(entry.events.length).toBe(0);
    /**
     * важная инварианта: даже без событий, одни тики должны менять состояние PoH ⇒ endHash отличается от startHash.
     */
    expect(entry.startHash).not.toBe(entry.endHash); // тики меняют состояние
  });

  it('stamps events into PoH so different events change endHash', () => {
    /**
     * Тест отделяет эффект тиков от эффекта событий; фиксирует, что события сериализуются/хэшируются и изменяют PoH.
     */
    // два одинаковых PoH
    /**
     * два идентичных генератора PoH (одинаковый seed), чтобы изолировать влияние только событий.
     */
    const poh1 = PoH.fromSeed('bb'.repeat(32));
    const poh2 = PoH.fromSeed('bb'.repeat(32));

    /**
     * оба делают ровно 3 тика, 
     * у e2 есть одно событие (условно «транзакция»), у e1 — нет.
     */
    // одинаковое число тиков, но во 2-м есть событие
    const e1 = buildEntry(poh1, 3, []);
    const e2 = buildEntry(poh2, 3, [{ kind: 'tx', payload: { id: 1, amount: 42 } }]);

    // sanity‑проверки на структуру.
    expect(e1.ticks).toBe(3);
    expect(e2.ticks).toBe(3);
    expect(e2.events.length).toBe(1);

    /**
     * ключевая проверка: вплетение событий (stamp) действительно влияет на конечный PoH‑хэш. 
     * При прочих равных, наличие события должно менять endHash.
     */
    // из-за вплетённого события endHash должен отличаться
    expect(e1.endHash).not.toBe(e2.endHash);
  });
});
