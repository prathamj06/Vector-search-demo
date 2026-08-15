export type DomainType = 'animals' | 'ecommerce' | 'movies';

export type ComplexityLevel = 'beginner' | 'standard' | 'advanced';

export interface Document {
  id: string;
  title: string;
  content: string;
  domain: DomainType;
  vector: number[]; // 4D dense vector [v1, v2, v3, v4]
  coords: { x: number; y: number }; // Projected 2D position (0-100 scale)
  isCustom?: boolean;
  complexity?: ComplexityLevel;
}

export interface SamplePrompt {
  query: string;
  explanation: string;
}

export interface DomainConfig {
  id: DomainType;
  label: string;
  icon: string;
  description: string;
  samplePrompts: SamplePrompt[];
  dimensions: string[]; // Labels for the 4 dimensions in this domain
  challenge: {
    targetQuery: string;
    description: string;
    hint: string;
  };
  defaultDocs: Document[];
}

export interface TokenInfo {
  text: string;
  isStopWord: boolean;
  originalIndex: number;
}

export interface InvertedIndexEntry {
  term: string;
  docIds: string[];
  count: number;
}

export interface KeywordSearchResult {
  doc: Document;
  matchScore: number; // 0 - 100%
  matchedTokens: string[];
  rawMatchCount: number;
}

export interface VectorSearchResult {
  doc: Document;
  similarity: number; // 0 - 100%
  distance: number;   // Euclidean distance on 2D or 4D space
  rank: number;
}

export type HybridMethod = 'linear' | 'rrf';

export interface HybridSearchResult {
  doc: Document;
  hybridScore: number;       // 0 - 100% normalized score for display
  rank: number;
  keywordScore: number;
  vectorScore: number;
  keywordRank: number;
  vectorRank: number;
  linearBreakdown?: {
    alpha: number;
    vectorComponent: number;
    keywordComponent: number;
  };
  rrfBreakdown?: {
    k: number;
    keywordRrfScore: number;
    vectorRrfScore: number;
    rawRrfScore: number;
  };
  badgeTag?: 'dual_consensus' | 'vector_rescued' | 'keyword_boosted';
}

export interface ConceptInfo {
  title: string;
  subtitle: string;
  whatItIs: string;
  whyItMatters: string;
  keywordVsVector: string;
}
