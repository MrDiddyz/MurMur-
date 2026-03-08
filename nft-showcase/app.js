const statusEl = document.getElementById('status');
const form = document.getElementById('mint-form');

const setStatus = (message) => {
  statusEl.textContent = `${new Date().toLocaleTimeString()} — ${message}`;
};

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const to = document.getElementById('to').value.trim();
  const uri = document.getElementById('uri').value.trim();

  if (!to || !uri) {
    setStatus('Please provide both receiver and token URI.');
    return;
  }

  setStatus(`Prepared mint transaction for ${to} with URI ${uri}.`);
});

document.getElementById('fee-btn').addEventListener('click', () => {
  setStatus('Prepared owner transaction: setMintFee(newFee).');
});

document.getElementById('withdraw-btn').addEventListener('click', () => {
  setStatus('Prepared owner transaction: withdraw(ownerAddress).');
});
