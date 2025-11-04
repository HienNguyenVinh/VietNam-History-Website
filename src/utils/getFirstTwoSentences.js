export const getFirstTwoSentences = (text) => {
  const sentences = text.split('.').filter(s => s.trim().length > 0);
  return sentences.slice(0, 2).join('. ') + (sentences.length > 2 ? '.' : '');
};
