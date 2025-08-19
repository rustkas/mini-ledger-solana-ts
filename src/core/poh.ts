// используем встроенный модуль Node.js для SHA256.
import { createHash } from 'crypto';

/**
 * Proof of History (PoH)
 * PoH is used in conjunction with proof of stake to drastically increase 
 * the efficiency of verifying and recording transactions on the Solana blockchain.
 */
export class PoH {
    // хранит текущее состояние в виде Buffer (байты).  
    private state: Buffer;

    private constructor(seed: Buffer) {
        // Конструктор приватный — создавать PoH напрямую нельзя, только через фабрику fromSeed.
        this.state = Buffer.from(seed);
    }

    /**
     * принимает строку hex длиной 64 символа (32 байта),
     * создаёт объект с этим состоянием.
     */
    static fromSeed(hexSeed: string) {
        if (hexSeed.length !== 64) throw new Error('seed must be 32 bytes hex');
        return new PoH(Buffer.from(hexSeed, 'hex'));
    }
    /**
     * возвращает текущее состояние в hex-строке (для сравнения и хранения).
     */
    current(): string {
        return this.state.toString('hex');
    }
    /**
     * делает один «тик» PoH: новое состояние = SHA256 от старого.
     * возвращает this (чтобы можно было чейнить вызовы).
     */
    tick(): this {
        this.state = createHash('sha256').update(this.state).digest();
        return this;
    }
/**
 * «вплетает» данные:
 * хэшируем данные,
 * хэшируем state || dataHash, 
 * обновляем состояние. 
 * 👉 Так данные становятся частью PoH-цепочки.
 */
    stamp(data: Buffer): this {
        const dataHash = createHash('sha256').update(data).digest();
        this.state = createHash('sha256').update(this.state).update(dataHash).digest();
        return this;
    }
}
