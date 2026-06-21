from ollama import chat

SYSTEM_PROMPT = "You are a concise assistant."
MODEL = "nemotron-cascade-2"


def main() -> None:
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    print(f"Starting chat with model: {MODEL}")
    print("Type 'exit' or 'quit' to stop.")

    while True:
        try:
            user_input = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nGoodbye!")
            break

        if not user_input:
            continue

        if user_input.lower() in {"exit", "quit"}:
            print("Goodbye!")
            break

        messages.append({"role": "user", "content": user_input})

        try:
            response = chat(model=MODEL, messages=messages)
        except Exception as exc:
            print(f"Assistant: [error] {exc}")
            messages.pop()
            continue

        assistant_text = response.message.content
        print(f"Assistant: {assistant_text}")
        messages.append({"role": "assistant", "content": assistant_text})


if __name__ == "__main__":
    main()
