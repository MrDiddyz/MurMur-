import random

from openai import OpenAI

from backend.config import OPENAI_API_KEY
from backend.db import get_connection
from backend.strategy import choose_strategy

client = OpenAI(api_key=OPENAI_API_KEY)


def generate_idea(strategy: str):
    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {
                "role": "user",
                "content": f"Generate a high-engagement social media post using strategy: {strategy}",
            }
        ],
    )
    return response.choices[0].message.content


def simulate_engagement():
    return random.uniform(0, 1)


def run_pipeline():
    strategy = choose_strategy()
    idea_content = generate_idea(strategy)

    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        "INSERT INTO ideas (content, strategy) VALUES (%s, %s) RETURNING id",
        (idea_content, strategy),
    )
    idea_id = cur.fetchone()[0]

    score = simulate_engagement()

    cur.execute(
        "INSERT INTO scores (idea_id, engagement) VALUES (%s, %s)",
        (idea_id, score),
    )

    cur.execute(
        "INSERT INTO strategy_memory (strategy, score) VALUES (%s, %s)",
        (strategy, score),
    )

    conn.commit()
    cur.close()
    conn.close()

    return {"strategy": strategy, "idea": idea_content, "score": score}
