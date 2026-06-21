const form = document.querySelector('#prompt-form');
const responseEl = document.querySelector('#response');
const statusEl = document.querySelector('#status');
const promptEl = document.querySelector('#prompt');
const promptHistoryEl = document.querySelector('#prompt-history');

const PROMPT_HISTORY_KEY = 'murmur.promptHistory';
const MAX_PROMPT_HISTORY = 10;

function getPromptHistory() {
  try {
    const raw = localStorage.getItem(PROMPT_HISTORY_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item) => typeof item === 'string' && item.trim().length > 0).slice(0, MAX_PROMPT_HISTORY);
  } catch {
    return [];
  }
}

function savePromptHistory(history) {
  localStorage.setItem(PROMPT_HISTORY_KEY, JSON.stringify(history.slice(0, MAX_PROMPT_HISTORY)));
}

function renderPromptHistory() {
  if (!promptHistoryEl) {
    return;
  }

  const history = getPromptHistory();
  promptHistoryEl.textContent = '';

  if (history.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'prompt-history-empty';
    empty.textContent = 'No recent prompts yet.';
    promptHistoryEl.append(empty);
    return;
  }

  for (const prompt of history) {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'prompt-history-item';
    button.textContent = prompt;
    button.title = prompt;
    button.addEventListener('click', () => {
      if (promptEl) {
        promptEl.value = prompt;
        promptEl.focus();
      }
    });

    li.append(button);
    promptHistoryEl.append(li);
  }
}

function addPromptToHistory(prompt) {
  const history = getPromptHistory();
  const deduped = history.filter((item) => item !== prompt);
  const updated = [prompt, ...deduped].slice(0, MAX_PROMPT_HISTORY);
  savePromptHistory(updated);
  renderPromptHistory();
}

renderPromptHistory();

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const prompt = new FormData(form).get('prompt')?.toString().trim();

  if (!prompt) {
    statusEl.textContent = 'Please enter a prompt first.';
    return;
  }

  addPromptToHistory(prompt);

  statusEl.textContent = 'Requesting response...';
  responseEl.textContent = '';

  try {
    const res = await fetch('/.netlify/functions/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    const payload = await res.json();

    if (!res.ok) {
      throw new Error(payload.error || `Request failed with status ${res.status}`);
    }

    responseEl.textContent = JSON.stringify(payload, null, 2);
    statusEl.textContent = 'Done.';
  } catch (error) {
    statusEl.textContent = `Error: ${error.message}`;
  }
});
