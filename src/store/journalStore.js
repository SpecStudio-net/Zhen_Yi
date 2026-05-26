const BASE = '/api/journal';

export async function loadJournal() {
  const res = await fetch(BASE);
  return res.json();
}

export async function saveReading(entry) {
  await fetch(BASE, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(entry),
  });
}

export async function updateNotes(id, notes) {
  await fetch(`${BASE}/${id}/notes`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ notes }),
  });
}

export async function toggleHidden(id) {
  await fetch(`${BASE}/${id}/hidden`, { method: 'PUT' });
}
