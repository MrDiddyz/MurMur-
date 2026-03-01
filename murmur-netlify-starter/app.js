const form = document.querySelector('#prompt-form');
const responseEl = document.querySelector('#response');
const statusEl = document.querySelector('#status');

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
