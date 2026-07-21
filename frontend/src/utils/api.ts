import { CONSTANTS } from "./constants";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Enhanced fetch with timeout and exponential backoff retry logic.
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = CONSTANTS.API.MAX_RETRIES,
  backoff = CONSTANTS.API.RETRY_DELAY
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONSTANTS.API.DEFAULT_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new ApiError(response.status, `HTTP Error: ${response.status}`);
    }

    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    // Check if we should retry (don't retry on 4xx errors, but retry on 5xx or network errors)
    const isRetryable = !(error instanceof ApiError) || error.status >= 500;

    if (retries > 0 && isRetryable) {
      console.warn(`Fetch failed (${error.message}). Retrying in ${backoff}ms...`);
      await new Promise((resolve) => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    
    throw error;
  }
}
