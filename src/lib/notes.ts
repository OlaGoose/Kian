export type NoteItem = {
  slug: string;
  status: 'seed' | 'growing' | 'mature';
};

export const NOTES: NoteItem[] = [
  { slug: 'seed-idea', status: 'seed' },
  { slug: 'in-progress-system-design', status: 'growing' },
  { slug: 'shipped-learning', status: 'mature' },
];

export function getNoteBySlug(slug: string) {
  return NOTES.find((note) => note.slug === slug);
}
