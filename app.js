const state = {
  latestResult: null,
  history: [],
  loading: false
};

const HISTORY_KEY = 'murmur_prompt_history_v1';
const HISTORY_LIMIT = 10;

const els = {
  genre: document.getElementById('genre'),
  mood: document.getElementById('mood'),
  artist: document.getElementById('artist'),
  output: document.getElementById('output'),
  status: document.getElementById('status'),
  blueprint: document.getElementById('blueprint'),
  remixes: document.getElementById('remixes'),
  historyList: document.getElementById('historyList'),
  generateBtn: document.getElementById('generateBtn'),
  remixBtn: document.getElementById('remixBtn')
};

function getInput() {
  return {
    genre: els.genre.value.trim(),
    mood: els.mood.value.trim(),
    artist: els.artist.value.trim()
  };
}

function setStatus(message, type = '') {
  els.status.textContent = message;
  els.status.className = `status ${type}`.trim();
}

function setLoading(isLoading) {
  state.loading = isLoading;
  els.generateBtn.disabled = isLoading;
  els.remixBtn.disabled = isLoading;
}

function renderBlueprint(blueprint) {
  if (!blueprint) {
    els.blueprint.innerHTML = '';
    return;
  }

  els.blueprint.innerHTML = `
    <h3>Blueprint</h3>
    <p class="kv"><strong>Title:</strong> ${blueprint.title}</p>
    <p class="kv"><strong>Style:</strong> ${blueprint.style}</p>
    <p class="kv"><strong>Structure:</strong> ${blueprint.structure}</p>
    <p class="kv"><strong>Instruments:</strong> ${blueprint.instruments}</p>
    <p class="kv"><strong>Mood:</strong> ${blueprint.mood}</p>
  `;
}

function createRemixes(basePrompt, input) {
  const variations = [
    `Version A: Keep ${input.mood} emotion but simplify arrangement and prioritize melody-first writing.`,
    `Version B: Push more rhythm complexity in the ${input.genre} groove while preserving vocal space.`,
    `Version C: Increase cinematic scale and tension in transitions with bigger dynamics.`,
    `Version D: Make the style influence of ${input.artist} subtle and modern rather than direct.`,
    'Version E: Reduce instrument count and focus on one unforgettable hook idea.'
  ];

  return variations.map((v, idx) => `${idx + 1}. ${basePrompt} ${v}`);
}

function renderRemixes(remixList) {
  if (!remixList.length) {
    els.remixes.innerHTML = '';
    return;
  }

  const items = remixList.map((item) => `<li>${item}</li>`).join('');
  els.remixes.innerHTML = `
    <h3>Remix variations</h3>
    <ol>${items}</ol>
  `;
}

function saveHistoryItem(input, result) {
  const item = {
    genre: input.genre,
    mood: input.mood,
    artist: input.artist,
    prompt: result.prompt,
    blueprintTitle: result.blueprint.title,
    createdAt: new Date().toISOString()
  };

  state.history = [item, ...state.history].slice(0, HISTORY_LIMIT);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history));
  renderHistory();
}

function renderHistory() {
  if (!state.history.length) {
    els.historyList.innerHTML = '<li class="history-item"><small>No prompt history yet.</small></li>';
    return;
  }

  els.historyList.innerHTML = '';
  state.history.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.setAttribute('role', 'button');
    li.setAttribute('tabindex', '0');
    li.innerHTML = `
      <strong>${item.blueprintTitle}</strong>
      <small>${item.genre} • ${item.mood} • ${item.artist}</small>
    `;

    const reload = () => {
      els.genre.value = item.genre;
      els.mood.value = item.mood;
      els.artist.value = item.artist;
      els.output.value = item.prompt;
      renderBlueprint({
        title: item.blueprintTitle,
        style: `${item.genre} + ${item.artist} influence`,
        structure: 'Loaded from history',
        instruments: 'Loaded from history',
        mood: item.mood
      });
      renderRemixes([]);
      setStatus(`Loaded session from ${new Date(item.createdAt).toLocaleString()}.`, 'success');
      state.latestResult = {
        prompt: item.prompt,
        blueprint: {
          title: item.blueprintTitle,
          style: `${item.genre} + ${item.artist} influence`,
          structure: 'Loaded from history',
          instruments: 'Loaded from history',
          mood: item.mood
        }
      };
    };

    li.addEventListener('click', reload);
    li.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        reload();
      }
    });

    els.historyList.appendChild(li);
  });
}

function loadHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    state.history = Array.isArray(parsed) ? parsed.slice(0, HISTORY_LIMIT) : [];
  } catch {
    state.history = [];
  }
  renderHistory();
}

async function generatePrompt() {
  const input = getInput();
  setLoading(true);
  setStatus('Generating prompt...');
  renderRemixes([]);

  try {
    const response = await fetch('/.netlify/functions/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Generation failed.');
    }

    state.latestResult = data;
    els.output.value = data.prompt;
    renderBlueprint(data.blueprint);
    saveHistoryItem(input, data);
    setStatus('Prompt generated successfully.', 'success');
  } catch (error) {
    setStatus(error.message, 'error');
  } finally {
    setLoading(false);
  }
}

function remixPrompt() {
  const input = getInput();
  const basePrompt = (state.latestResult && state.latestResult.prompt) || els.output.value.trim();

  if (!basePrompt) {
    setStatus('Generate a prompt first, or enter details to remix.', 'error');
    return;
  }

  const remixes = createRemixes(basePrompt, input);
  renderRemixes(remixes);
  setStatus('Created 5 remix variations.', 'success');
}

els.generateBtn.addEventListener('click', generatePrompt);
els.remixBtn.addEventListener('click', remixPrompt);

loadHistory();
