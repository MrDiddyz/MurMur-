const form = document.querySelector('#prompt-form');
const responseEl = document.querySelector('#response');
const statusEl = document.querySelector('#status');

const TOKEN_KEY = 'murmur_link_token';

async function maybeExchangeAccessLink() {
  console.log('pathname:', window.location.pathname);
  console.log('href:', window.location.href);

  const path = window.location.pathname || '';
  const match = path.match(/^\/a\/([^/]+)$/);
  const linkToken = match?.[1] ?? null;

  if (!linkToken) return;

  try {
    const res = await fetch('/.netlify/functions/link-login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ linkToken }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || 'Link login failed');
    }

    localStorage.setItem(TOKEN_KEY, data.token);
    window.history.replaceState({}, '', '/');
  } catch (error) {
    console.error(error);
  }
}

void maybeExchangeAccessLink();

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const prompt = new FormData(form).get('prompt')?.toString().trim();

  if (!prompt) {
    statusEl.textContent = 'Please enter a prompt first.';
    return;
  }

  statusEl.textContent = 'Requesting response...';
  responseEl.textContent = '';

  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const res = await fetch('/.netlify/functions/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
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
