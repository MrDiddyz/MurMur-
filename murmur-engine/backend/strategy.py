import random

from backend.db import get_connection

STRATEGIES = [
    "emotional_storytelling",
    "controversial_opinion",
    "educational_value",
    "motivational_quote",
]

EXPLORATION_RATE = 0.2


def get_strategy_stats():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT strategy, AVG(score)
        FROM strategy_memory
        GROUP BY strategy
    """
    )

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return {row[0]: row[1] for row in rows}


def choose_strategy():
    stats = get_strategy_stats()

    if not stats or random.random() < EXPLORATION_RATE:
        return random.choice(STRATEGIES)

    return max(stats, key=stats.get)
