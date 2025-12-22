export const getFirst50Words = (text) => {
  if (!text) return '';
  const words = text.trim().split(/\s+/);
  return words.slice(0, 50).join(' ');
};
