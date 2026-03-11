const characters = [
  {
    name: 'Mira Flux',
    summary: 'A street alchemist who paints portals with light-reactive ink.',
    role: 'Portal Artist',
  },
  {
    name: 'Rook Null',
    summary: 'Ex-security drone pilot who can ghost through surveillance grids.',
    role: 'Tactical Scout',
  },
  {
    name: 'Echo Venn',
    summary: 'Archivist of lost timelines, armed with a memory-forging quill.',
    role: 'Lore Keeper',
  },
];

const comics = [
  {
    title: 'Issue #01: Neon Whispers',
    synopsis: 'Mira uncovers a map hidden in rain reflections that points to a buried station.',
    status: 'Published',
  },
  {
    title: 'Issue #02: Null Zone Run',
    synopsis: 'Rook leads a midnight extraction while the city AI hunts for anomalies.',
    status: 'In Progress',
  },
  {
    title: 'Issue #03: Echoes of Tomorrow',
    synopsis: 'Echo rewrites one memory to save the crew—and fractures the timeline.',
    status: 'Draft',
  },
];

function renderCard({ title, subtitle, body }, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const card = document.createElement('article');
  card.className = 'card';
  card.innerHTML = `
    <h3>${title}</h3>
    <p>${body}</p>
    <div class="meta">${subtitle}</div>
  `;

  container.appendChild(card);
}

characters.forEach((character) => {
  renderCard(
    {
      title: character.name,
      subtitle: character.role,
      body: character.summary,
    },
    'characters',
  );
});

comics.forEach((comic) => {
  renderCard(
    {
      title: comic.title,
      subtitle: `Status: ${comic.status}`,
      body: comic.synopsis,
    },
    'comics',
  );
});
