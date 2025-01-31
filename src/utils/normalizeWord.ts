export function normalizeWord(word: string) {
  return word.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}