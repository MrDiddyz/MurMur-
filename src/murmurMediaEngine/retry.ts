export async function withRetry<T>(
  work: () => Promise<T> | T,
  retries = 2,
  delayMs = 100,
): Promise<T> {
  let attempt = 0;
  let lastError: unknown;

  while (attempt <= retries) {
    try {
      return await work();
    } catch (error) {
      lastError = error;
      if (attempt === retries) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
    }
    attempt += 1;
  }

  throw lastError;
}
