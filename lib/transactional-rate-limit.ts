const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

type LimitResult = {
  allowed: boolean;
  retryAfterMs: number;
};

const requestMap = new Map<string, number>();

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function cleanupExpired(now: number) {
  for (const [key, timestamp] of requestMap.entries()) {
    if (now - timestamp >= WINDOW_MS) {
      requestMap.delete(key);
    }
  }
}

export function checkTransactionalRequestLimit(action: string, identity: string): LimitResult {
  const now = Date.now();
  cleanupExpired(now);

  const key = `${normalize(action)}:${normalize(identity)}`;
  const previous = requestMap.get(key);

  if (previous && now - previous < WINDOW_MS) {
    return {
      allowed: false,
      retryAfterMs: WINDOW_MS - (now - previous),
    };
  }

  requestMap.set(key, now);
  return { allowed: true, retryAfterMs: 0 };
}

export function getTransactionalRetryMessage() {
  return "Please wait 15 minutes before sending this request again.";
}
