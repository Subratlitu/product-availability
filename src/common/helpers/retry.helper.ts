import axios, { AxiosError } from 'axios';

export interface RetryConfig {
  retries: number;       // how many retry attempts
  timeoutMs: number;     // axios timeout per request
  retryDelayMs?: number; // optional delay between retries
}

function sleep(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

export async function axiosWithRetry<T>(url: string, config: RetryConfig): Promise<T> {
  let attempt = 0;

  while (attempt <= config.retries) {
    try {
      const response = await axios.get(url, {
        timeout: config.timeoutMs,
        validateStatus: () => true, // we'll manually handle status
      });

      // Server error → retry
      if (response.status >= 500) {
        throw new Error(`Server Error ${response.status}`);
      }

      return response.data as T;
    } catch (err) {
      const error = err as AxiosError;

      const isTimeout = error.code === 'ECONNABORTED';
      const isServerError = error.response && error.response.status >= 500;

      // Not retry conditions:
      if (!isTimeout && !isServerError) {
        throw err;
      }

      // If retries over → throw
      if (attempt === config.retries) {
        throw err;
      }

      // delay between retries
      if (config.retryDelayMs) {
        await sleep(config.retryDelayMs);
      }

      attempt++;
    }
  }

  throw new Error('axiosWithRetry unexpected exit');
}
