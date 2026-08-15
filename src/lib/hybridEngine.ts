import { KeywordSearchResult, VectorSearchResult, HybridSearchResult, HybridMethod } from './types';

/**
 * Perform client-side Hybrid Search combining Keyword (Lexical) and Vector (Semantic) search results.
 * Supports both Linear Weighted Combination (alpha-blend) and Reciprocal Rank Fusion (RRF).
 */
export function performHybridSearch(
  keywordResults: KeywordSearchResult[],
  vectorResults: VectorSearchResult[],
  method: HybridMethod = 'linear',
  alpha: number = 0.5,
  k: number = 60
): HybridSearchResult[] {
  // Map document IDs to their respective engine results
  const keywordMap = new Map<string, { result: KeywordSearchResult; rank: number }>();
  keywordResults.forEach((kr, idx) => {
    keywordMap.set(kr.doc.id, { result: kr, rank: idx + 1 });
  });

  const vectorMap = new Map<string, { result: VectorSearchResult; rank: number }>();
  vectorResults.forEach((vr) => {
    vectorMap.set(vr.doc.id, { result: vr, rank: vr.rank });
  });

  // Collect all unique document IDs
  const allDocIds = new Set<string>([...keywordMap.keys(), ...vectorMap.keys()]);
  const hybridList: HybridSearchResult[] = [];

  allDocIds.forEach((docId) => {
    const kEntry = keywordMap.get(docId);
    const vEntry = vectorMap.get(docId);

    const doc = kEntry?.result.doc || vEntry?.result.doc!;
    const keywordScore = kEntry?.result.matchScore || 0;
    const vectorScore = vEntry?.result.similarity || 0;
    const keywordRank = kEntry?.rank || 999;
    const vectorRank = vEntry?.rank || 999;

    let hybridScore = 0;
    let linearBreakdown: HybridSearchResult['linearBreakdown'] = undefined;
    let rrfBreakdown: HybridSearchResult['rrfBreakdown'] = undefined;

    if (method === 'linear') {
      // Linear weighted blend: Score = alpha * Vector + (1 - alpha) * Keyword
      const vectorComponent = Number((alpha * vectorScore).toFixed(1));
      const keywordComponent = Number(((1 - alpha) * keywordScore).toFixed(1));
      hybridScore = Number((vectorComponent + keywordComponent).toFixed(1));

      linearBreakdown = {
        alpha,
        vectorComponent,
        keywordComponent,
      };
    } else {
      // Reciprocal Rank Fusion (RRF): RRF = 1/(k + rank_vec) + (hasKeywordMatch ? 1/(k + rank_key) : 0)
      const hasKeywordMatch = keywordScore > 0;
      const hasVectorMatch = vectorScore > 10;

      const vectorRrfScore = hasVectorMatch ? 1 / (k + vectorRank) : 0;
      const keywordRrfScore = hasKeywordMatch ? 1 / (k + keywordRank) : 0;
      const rawRrfScore = Number((vectorRrfScore + keywordRrfScore).toFixed(6));

      // Theoretical max RRF score when rank=1 in both: (1/(k+1) + 1/(k+1))
      const maxPossibleRrf = 2 / (k + 1);
      // Normalized percentage for consistent UI visualization (0-100%)
      hybridScore = Number(((rawRrfScore / maxPossibleRrf) * 100).toFixed(1));

      rrfBreakdown = {
        k,
        keywordRrfScore: Number(keywordRrfScore.toFixed(6)),
        vectorRrfScore: Number(vectorRrfScore.toFixed(6)),
        rawRrfScore,
      };
    }

    // Assign pedagogical badge
    let badgeTag: HybridSearchResult['badgeTag'] = undefined;
    if (keywordScore >= 40 && vectorScore >= 75) {
      badgeTag = 'dual_consensus';
    } else if (keywordScore === 0 && vectorScore >= 75) {
      badgeTag = 'vector_rescued';
    } else if (keywordScore >= 60 && vectorScore < 60) {
      badgeTag = 'keyword_boosted';
    }

    hybridList.push({
      doc,
      hybridScore,
      rank: 0,
      keywordScore,
      vectorScore,
      keywordRank,
      vectorRank,
      linearBreakdown,
      rrfBreakdown,
      badgeTag,
    });
  });

  // Sort descending by calculated hybrid score
  if (method === 'linear') {
    hybridList.sort((a, b) => b.hybridScore - a.hybridScore);
  } else {
    hybridList.sort((a, b) => (b.rrfBreakdown?.rawRrfScore || 0) - (a.rrfBreakdown?.rawRrfScore || 0));
  }

  // Assign sequential hybrid ranks
  hybridList.forEach((item, idx) => {
    item.rank = idx + 1;
  });

  return hybridList;
}
