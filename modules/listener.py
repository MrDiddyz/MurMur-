import json
from openai import OpenAI

client = OpenAI()

def run_listener(user_text: str) -> dict:
    with open("prompts/listener.txt", "r", encoding="utf-8") as f:
        prompt = f.read()

    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": user_text},
        ],
        temperature=0.2,
    )

    content = resp.choices[0].message.content.strip()
    return json.loads(content)
