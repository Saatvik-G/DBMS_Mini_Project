import re
import math
import hashlib
from typing import List, Dict, Any

EMBEDDING_DIM = 64

def _hash_token(token: str, seed: int) -> int:
    h = hashlib.sha256(f"{seed}:{token}".encode("utf-8")).digest()
    return int.from_bytes(h[:4], "big")

def generate_embedding(text: str, dim: int = EMBEDDING_DIM) -> List[float]:
    """
    Generates a deterministic 64-dimensional dense unit-length embedding vector
    from textual input using multi-seed feature hashing over token and character
    n-grams. Operates 100% offline with zero external dependencies.
    """
    if not text or not text.strip():
        return [0.0] * dim

    vec = [0.0] * dim
    clean_text = text.lower()
    tokens = re.findall(r"\b[a-z0-9_]{2,}\b", clean_text)

    # 1. Word token hashing with frequency weighting
    for token in tokens:
        for seed in (7, 42, 101):
            idx = _hash_token(token, seed) % dim
            sign = 1.0 if (_hash_token(token, seed + 1) % 2 == 0) else -1.0
            weight = 1.5 if len(token) > 4 else 1.0
            vec[idx] += sign * weight

    # 2. Character 3-gram hashing for sub-word semantic resilience (typos, inflections)
    for i in range(len(clean_text) - 2):
        ngram = clean_text[i:i+3]
        if " " not in ngram:
            idx = _hash_token(ngram, 13) % dim
            sign = 1.0 if (_hash_token(ngram, 19) % 2 == 0) else -1.0
            vec[idx] += sign * 0.35

    # 3. L2 Normalization to unit hypersphere (sum of squares = 1.0)
    norm = math.sqrt(sum(v * v for v in vec))
    if norm > 0.0:
        vec = [round(v / norm, 5) for v in vec]
    else:
        vec = [0.0] * dim

    return vec

def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    """
    Calculates cosine similarity between two unit vectors.
    Since vectors are L2-normalized, cosine similarity equals the dot product.
    """
    if not vec_a or not vec_b or len(vec_a) != len(vec_b):
        return 0.0

    dot = sum(a * b for a, b in zip(vec_a, vec_b))
    # Bound within [-1.0, 1.0] to prevent floating point drift
    return max(-1.0, min(1.0, float(dot)))
