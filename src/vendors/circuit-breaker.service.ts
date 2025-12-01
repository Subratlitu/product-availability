// src/vendors/circuit-breaker.service.ts
import { Injectable, Logger } from '@nestjs/common';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface BreakerState {
  state: CircuitState;
  failureCount: number;
  nextAttemptTime: number; // timestamp when we allow half-open attempt
}

/**
 * Simple in-memory circuit breaker manager.
 * - Open after `failureThreshold` consecutive failures.
 * - Stay OPEN for `cooldownMs`.
 * - After cooldown, moves to HALF_OPEN and allows one trial request.
 * - A single success closes the circuit; a failure re-opens it.
 *
 * This is lightweight and suitable for local/assignment use.
 * For production across instances, persist state to Redis.
 */
@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private breakers = new Map<string, BreakerState>();

  // Default config (can be extended to read from env)
  private readonly failureThreshold = 3; // 3 consecutive failures -> open
  private readonly cooldownMs = 30_000; // 30 seconds cooldown

  private getStateForKey(key: string): BreakerState {
    if (!this.breakers.has(key)) {
      this.breakers.set(key, {
        state: 'CLOSED',
        failureCount: 0,
        nextAttemptTime: 0,
      });
    }
    return this.breakers.get(key)!;
  }

  /**
   * Check if request is allowed for the given key (vendor identifier).
   * If circuit is OPEN and cooldown not passed → deny.
   * If cooldown passed → transition to HALF_OPEN and allow one trial.
   */
  canRequest(key = 'default'): boolean {
    const s = this.getStateForKey(key);
    const now = Date.now();

    if (s.state === 'OPEN') {
      if (now >= s.nextAttemptTime) {
        s.state = 'HALF_OPEN';
        this.logger.warn(`[Circuit:${key}] moving to HALF_OPEN (trial)`);
        return true;
      }
      // still open
      return false;
    }

    // CLOSED or HALF_OPEN -> allowed
    return true;
  }

  /**
   * Call when the vendor request ultimately succeeded (after retries).
   * On success, reset failureCount and close the circuit.
   */
  onSuccess(key = 'default') {
    const s = this.getStateForKey(key);
    s.failureCount = 0;
    if (s.state !== 'CLOSED') {
      s.state = 'CLOSED';
      this.logger.log(`[Circuit:${key}] CLOSED (recovered)`);
    }
  }

  /**
   * Call when the vendor request ultimately failed (after retries).
   * Increments failure counter. If threshold reached, open the circuit.
   */
  onFailure(key = 'default') {
    const s = this.getStateForKey(key);
    s.failureCount = (s.failureCount || 0) + 1;

    this.logger.warn(`[Circuit:${key}] failureCount=${s.failureCount}`);

    if (s.failureCount >= this.failureThreshold) {
      s.state = 'OPEN';
      s.nextAttemptTime = Date.now() + this.cooldownMs;
      this.logger.error(
        `[Circuit:${key}] OPEN - reached ${this.failureThreshold} failures. Cooling down for ${this.cooldownMs}ms`,
      );
    } else {
      // if in HALF_OPEN and failed, re-open immediately
      if (s.state === 'HALF_OPEN') {
        s.state = 'OPEN';
        s.nextAttemptTime = Date.now() + this.cooldownMs;
        this.logger.error(`[Circuit:${key}] Re-OPEN (trial failed). Cooling down.`);
      }
    }
  }

  // Optional helper for status (useful for debugging)
  status(key = 'default') {
    const s = this.getStateForKey(key);
    return {
      state: s.state,
      failureCount: s.failureCount,
      nextAttemptTime: s.nextAttemptTime,
      willAllow: this.canRequest(key),
    };
  }
}
