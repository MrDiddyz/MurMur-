from modules.listener import run_listener
from modules.memory import append_log, build_log_entry, update_from_listener
from modules.spectre import run_spectre_mode
from modules.synthesizer import run_synthesizer


def run_murmur(user_text: str, tone: str) -> str:
    listener_output = run_listener(user_text)
    state = update_from_listener(listener_output)
    spectre_output = run_spectre_mode(user_text, listener_output, state)
    final_response = run_synthesizer(spectre_output, tone)

    append_log(
        build_log_entry(
            user_text=user_text,
            tone=tone,
            listener_output=listener_output,
            planner_output=spectre_output,
            final_response=final_response,
        )
    )

    return final_response
