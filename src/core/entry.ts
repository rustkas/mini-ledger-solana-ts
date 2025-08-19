import { createHash } from 'crypto';
import { PoH } from './poh';

export type EntryEvent = {
  kind: 'tx';
  // произвольные данные события — для тестов и будущих Tx
  payload?: unknown;
};

export interface Entry {
  startHash: string;     // состояние PoH до тиков/событий
  ticks: number;         // сколько тиков прокручено
  events: EntryEvent[];  // события, «вплетённые» в PoH
  endHash: string;       // состояние после тиков и событий
}

/**
 * Собирает Entry:
 *  1) делает `ticks` тиков PoH,
 *  2) вплетает (stamp) события (их JSON-хэш) в PoH,
 *  3) возвращает сводку Entry.
 */
export function buildEntry(poh: PoH, ticks: number, events: EntryEvent[]): Entry {
  const startHash = poh.current();

  // 1) тики
  for (let i = 0; i < ticks; i++) {
    poh.tick();
  }

  // 2) события: сериализуем и «вплетаем» в PoH
  for (const ev of events) {
    const bytes = Buffer.from(JSON.stringify(ev));
    poh.stamp(bytes);
  }

  const endHash = poh.current();

  return {
    startHash,
    ticks,
    events,
    endHash,
  };
}

/**
 * Хэш Entry — пригодится позже (Slot/Validator) для детерминированной проверки.
 */
export function hashEntry(e: Entry): string {
  const h = createHash('sha256')
    .update(e.startHash)
    .update(String(e.ticks))
    .update(Buffer.from(JSON.stringify(e.events)))
    .update(e.endHash)
    .digest('hex');
  return h;
}
