import { Document, InvertedIndexEntry, KeywordSearchResult, TokenInfo } from './types';

export const COMMON_STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'in', 'on', 'at', 'to', 'with', 'for', 'and', 'or', 'of', 'this', 'that', 'it', 'be', 'are', 'was', 'were', 'by', 'as', 'from'
]);

/**
 * Tokenize input string into word tokens with stop-word classification.
 */
export function tokenizeQuery(rawQuery: string): TokenInfo[] {
  const words = rawQuery
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .split(/\s+/);

  return words
    .filter(w => w.length > 0)
    .map((text, originalIndex) => ({
      text,
      isStopWord: COMMON_STOP_WORDS.has(text),
      originalIndex,
    }));
}

/**
 * Generate an Inverted Index ("Back-of-the-Book Index") from the given documents dataset.
 */
export function generateInvertedIndex(docs: Document[]): InvertedIndexEntry[] {
  const indexMap = new Map<string, Set<string>>();

  docs.forEach(doc => {
    const words = doc.content
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .split(/\s+/);

    words.forEach(word => {
      if (word.length > 0 && !COMMON_STOP_WORDS.has(word)) {
        if (!indexMap.has(word)) {
          indexMap.set(word, new Set());
        }
        indexMap.get(word)!.add(doc.id);
      }
    });
  });

  const indexList: InvertedIndexEntry[] = [];
  indexMap.forEach((docSet, term) => {
    indexList.push({
      term,
      docIds: Array.from(docSet),
      count: docSet.size,
    });
  });

  // Sort alphabetically by term
  return indexList.sort((a, b) => a.term.localeCompare(b.term));
}

/**
 * Perform client-side Keyword (Lexical) Search based on exact token matching.
 */
export function performKeywordSearch(query: string, docs: Document[]): { tokens: TokenInfo[]; activeTokens: TokenInfo[]; filteredStopWords: TokenInfo[]; results: KeywordSearchResult[] } {
  const tokens = tokenizeQuery(query);
  const activeTokens = tokens.filter(t => !t.isStopWord);
  const filteredStopWords = tokens.filter(t => t.isStopWord);

  const activeTokenTexts = activeTokens.map(t => t.text);

  const results: KeywordSearchResult[] = docs.map(doc => {
    const docWords = doc.content
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .split(/\s+/);

    const matchedTokens: string[] = [];
    let rawMatchCount = 0;

    activeTokenTexts.forEach(token => {
      // Count exact matches or word prefix matches
      const occurrences = docWords.filter(dw => dw === token || (token.length > 3 && dw.includes(token))).length;
      if (occurrences > 0) {
        matchedTokens.push(token);
        rawMatchCount += occurrences;
      }
    });

    let matchScore = 0;
    if (activeTokenTexts.length > 0) {
      const matchRatio = matchedTokens.length / activeTokenTexts.length;
      matchScore = Number((matchRatio * 100).toFixed(1));
    }

    return {
      doc,
      matchScore,
      matchedTokens,
      rawMatchCount,
    };
  });

  // Sort descending by match score and raw match count
  results.sort((a, b) => b.matchScore - a.matchScore || b.rawMatchCount - a.rawMatchCount);

  return {
    tokens,
    activeTokens,
    filteredStopWords,
    results,
  };
}
