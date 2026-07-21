import time
from typing import Any, Dict

class SimpleCache:
    def __init__(self):
        self._cache: Dict[str, dict] = {}
        
    def get(self, key: str) -> Any:
        if key in self._cache:
            entry = self._cache[key]
            if entry['expires_at'] is None or entry['expires_at'] > time.time():
                return entry['data']
            else:
                del self._cache[key]
        return None
        
    def set(self, key: str, data: Any, ttl_seconds: int = None):
        expires_at = time.time() + ttl_seconds if ttl_seconds else None
        self._cache[key] = {
            'data': data,
            'expires_at': expires_at
        }
        
    def invalidate(self, key: str):
        if key in self._cache:
            del self._cache[key]

# Global cache instance
cache = SimpleCache()
