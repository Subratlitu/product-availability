// src/vendors/circuit-breaker.util.ts
import { Injectable, Logger } from '@nestjs/common';

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

@Injectable()
export class CircuitBreaker {
  private readonly logger = new Logger(CircuitBreaker.name);

  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private readonly failureThreshold = 3;      // after 3 failures → OPEN
  private readonly halfOpenTimeout = 15000;   // 15 sec before trying HALF-OPEN
  private nextAttemptTime = 0;

  isClosed() {
    return this.state === CircuitState.CLOSED;
  }

  isOpen() {
    return this.state === CircuitState.OPEN;
  }

  isHalfOpen() {
    return this.state === CircuitState.HALF_OPEN;
  }

  /**
   * Check if a call is allowed:
   * - CLOSED → allowed
   * - OPEN → allowed only if nextAttemptTime passed → HALF_OPEN
   */
  canRequest(): boolean {
    const now = Date.now();

    if (this.state === CircuitState.OPEN) {
      if (now >= this.nextAttemptTime) {
        this.state = CircuitState.HALF_OPEN;
        this.logger.warn(`CIRCUIT HALF-OPEN (testing VendorC again)...`);
        return true;
      }
      return false;
    }
    return true;
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
  }

  onFailure() {
    this.failureCount++;

    if (this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttemptTime = Date.now() + this.halfOpenTimeout;
      this.logger.error(
        `CIRCUIT OPEN: VendorC unreachable. Blocking requests for ${this.halfOpenTimeout / 1000}s`,
      );
    }
  }
}
