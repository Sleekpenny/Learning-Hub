// "Modern React from Scratch" -> "modern-react-from-scratch"
export function slugify(text: string) {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'course';
}