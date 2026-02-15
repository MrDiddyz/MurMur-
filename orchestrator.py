from modules.listener import run_listener
from modules.thinker import run_thinker
from modules.synthesizer import run_synthesizer

def run_murmur(user_text: str, tone: str) -> str:
    listener_output = run_listener(user_text)
    thinker_output = run_thinker(user_text, listener_output)
    final_response = run_synthesizer(thinker_output, tone)
    return final_response
