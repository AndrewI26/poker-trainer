import math
import time
from collections import defaultdict, deque
from threading import Lock

from fastapi import HTTPException, Request, status


class RateLimit:
    def __init__(self, limit: int, window_seconds: int):
        self.limit = limit
        self.window_seconds = window_seconds
        self._hits: defaultdict[str, deque[float]] = defaultdict(deque)
        self._lock = Lock()

    def __call__(self, request: Request) -> None:
        key = request.client.host if request.client else "unknown"
        now = time.monotonic()

        with self._lock:
            hits = self._hits[key]
            while hits and hits[0] <= now - self.window_seconds:
                hits.popleft()

            if len(hits) >= self.limit:
                retry_after = math.ceil(hits[0] + self.window_seconds - now)
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many requests, please try again later",
                    headers={"Retry-After": str(retry_after)},
                )

            hits.append(now)


demo_rate_limit = RateLimit(limit=5, window_seconds=60 * 60)
login_rate_limit = RateLimit(limit=10, window_seconds=60)
signup_rate_limit = RateLimit(limit=5, window_seconds=60 * 60)
