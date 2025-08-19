import { describe, it, expect } from 'vitest';
import { PoH } from '../core/poh';
import { buildEntry, EntryEvent, hashEntry  } from '../core/entry';

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

   it('determinism: same seed, same ticks, same events => same endHash & hashEntry', () => {
    const seed = 'cc'.repeat(32);
    const evsA: EntryEvent[] = [{ kind: 'tx', payload: { id: 7, amount: 100, note: 'abc' } }];
    const evsB: EntryEvent[] = [{ kind: 'tx', payload: { id: 7, amount: 100, note: 'abc' } }];

    const poh1 = PoH.fromSeed(seed);
    const poh2 = PoH.fromSeed(seed);

    const a = buildEntry(poh1, 4, evsA);
    const b = buildEntry(poh2, 4, evsB);

    expect(a.endHash).toBe(b.endHash);
    expect(hashEntry(a)).toBe(hashEntry(b));
  });

  it('order sensitivity: events order changes endHash', () => {
    const seed = 'dd'.repeat(32);
    const poh1 = PoH.fromSeed(seed);
    const poh2 = PoH.fromSeed(seed);

    const evAB: EntryEvent[]= [
      { kind: 'tx', payload: { id: 1 } },
      { kind: 'tx', payload: { id: 2 } },
    ];
    const evBA: EntryEvent[] = [
      { kind: 'tx', payload: { id: 2 } },
      { kind: 'tx', payload: { id: 1 } },
    ];

    const a = buildEntry(poh1, 2, evAB);
    const b = buildEntry(poh2, 2, evBA);

    expect(a.endHash).not.toBe(b.endHash);
  });

  it('empty entry: ticks=0 and no events => startHash equals endHash', () => {
    const poh = PoH.fromSeed('ee'.repeat(32));
    const e = buildEntry(poh, 0, []);
    expect(e.startHash).toBe(e.endHash);
  });

  it('stable serialization: equal objects with different key insertion order produce same endHash', () => {
    const seed = 'ff'.repeat(32);
    const poh1 = PoH.fromSeed(seed);
    const poh2 = PoH.fromSeed(seed);

    // Один и тот же объект по смыслу, но ключи добавлены в разном порядке
    const ev1: EntryEvent = { kind: "tx", payload: { a: 1, b: 2, c: { x: 10, y: 20 } } };
    const ev2: EntryEvent = { kind: "tx", payload: (() => { const o: any = {}; o.b = 2; o.a = 1; o.c = { y: 20, x: 10 }; return o; })() };

    const a = buildEntry(poh1, 1, [ev1]);
    const b = buildEntry(poh2, 1, [ev2]);

    expect(a.endHash).toBe(b.endHash);
  });

  it('hashEntry changes if any field differs (smoke)', () => {
    const poh = PoH.fromSeed('11'.repeat(32));
    const e1 = buildEntry(poh, 2, [{ kind: 'tx', payload: { id: 1 } }]);
    // клонируем состояние PoH заново для изоляции
    const poh2 = PoH.fromSeed('11'.repeat(32));
    const e2 = buildEntry(poh2, 3, [{ kind: 'tx', payload: { id: 1 } }]); // ticks отличаются

    expect(hashEntry(e1)).not.toBe(hashEntry(e2));
  });
});
