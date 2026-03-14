import redis
from app.config import settings
import json
from typing import Any
import time
import hashlib
from datetime import datetime, date

_redis = None
_mem: dict = {}

def _get_redis():
    global _redis
    if _redis is not None:
        return _redis if _redis is not False else None
    try:
        redis_url = settings.REDIS_URL
        if not redis_url:
            _redis = False
            return None
        client = redis.from_url(redis_url, decode_responses=True)
        client.ping()
        _redis = client
        return _redis
    except Exception:
        _redis = False
        return None

def now_ms():
    return int(time.time() * 1000)

def _json_serializer(obj):
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise TypeError(f"Object of type {type(obj).__name__} is not JSON serializable")

def cache_get(key: str) -> Any:
    r = _get_redis()
    if r:
        try:
            v = r.get(key)
            return json.loads(v) if v else None
        except Exception:
            return None
    item = _mem.get(key)
    if not item:
        return None
    if item["exp"] and item["exp"] < now_ms():
        del _mem[key]
        return None
    return item["val"]

def cache_set(key: str, val: Any, ttl_sec: int = 10):
    r = _get_redis()
    text = json.dumps(val, default=_json_serializer)
    if r:
        try:
            r.set(key, text, ex=max(1, ttl_sec))
        except Exception:
            pass
        return
    _mem[key] = {"val": val, "exp": now_ms() + ttl_sec * 1000}

def make_key(prefix: str, obj: dict) -> str:
    base = json.dumps(obj, sort_keys=True)
    h = hashlib.sha1(base.encode()).hexdigest()
    return f"{prefix}:{h}"