export function chunkText(text, chunkSize = 1000, overlap = 150) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }

  return chunks;
}

export function splitIntoPages(text) {
  const pageMarkerRegex = /-{2,}\s*\d+\s*of\s*\d+\s*-{2,}/g;
  const rawPages = text.split(pageMarkerRegex);
  return rawPages
    .map((pageText, index) => ({
      pageNumber: index + 1,
      text: pageText.trim()
    }))
    .filter((p) => p.text.length > 0);
}

export const ROLE_CATEGORY_ACCESS = {
  admin: ['technical', 'hr', 'finance', 'general'],
  support: ['technical', 'general'],
  hr: ['hr', 'general'],
};

export function getAllowedCategories(role) {
  return ROLE_CATEGORY_ACCESS[role] || ['general'];
}