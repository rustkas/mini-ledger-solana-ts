import { createHash } from 'crypto';

export class PoH {
  private state: Buffer;

  private constructor(seed: Buffer) {
    this.state = Buffer.from(seed);
  }

  static fromSeed(hexSeed: string) {
    if (hexSeed.length !== 64) throw new Error('seed must be 32 bytes hex');
    return new PoH(Buffer.from(hexSeed, 'hex'));
  }

  current(): string {
    return this.state.toString('hex');
  }

  tick(): this {
    this.state = createHash('sha256').update(this.state).digest();
    return this;
  }

  stamp(data: Buffer): this {
    const dataHash = createHash('sha256').update(data).digest();
    this.state = createHash('sha256').update(this.state).update(dataHash).digest();
    return this;
  }
}
