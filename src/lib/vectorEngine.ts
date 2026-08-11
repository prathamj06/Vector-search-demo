import { Document, VectorSearchResult } from './types';

// Stop words for filtering during semantic feature extraction
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'in', 'on', 'at', 'to', 'with', 'for', 'and', 'or', 'of', 'this', 'that', 'it', 'be', 'are', 'was', 'were', 'about'
]);

// Semantic keyword maps for 4 dimensions across domains
const FEATURE_DICTIONARY: Record<string, number[]> = {
  // Animals & Speed Domain: [Animals/Pets, Speed/Agility, Food/Hunger, Rest/Comfort]
  'dog': [0.95, 0.50, 0.10, -0.10],
  'canine': [0.95, 0.55, 0.10, -0.10],
  'hound': [0.92, 0.60, 0.10, -0.10],
  'puppy': [0.90, 0.40, 0.80, 0.20],
  'cat': [0.90, 0.20, 0.10, 0.70],
  'feline': [0.92, 0.20, 0.10, 0.75],
  'kitten': [0.88, 0.25, 0.20, 0.85],
  'speedy': [0.10, 0.95, 0.00, 0.00],
  'quick': [0.10, 0.95, 0.00, 0.00],
  'fast': [0.10, 0.95, 0.00, 0.00],
  'chasing': [0.20, 0.90, 0.00, 0.00],
  'running': [0.15, 0.92, 0.00, 0.00],
  'lazy': [-0.10, -0.80, 0.00, 0.85],
  'sleeping': [-0.10, -0.85, 0.00, 0.95],
  'napping': [-0.10, -0.85, 0.00, 0.90],
  'resting': [-0.10, -0.80, 0.00, 0.88],
  'hungry': [0.10, 0.20, 0.95, 0.00],
  'tasty': [-0.20, 0.00, 0.98, 0.00],
  'noodles': [-0.30, 0.00, 0.95, 0.10],
  'food': [-0.20, 0.00, 0.90, 0.10],
  'spicy': [-0.30, 0.00, 0.92, -0.10],
  'broth': [-0.30, 0.00, 0.88, 0.20],

  // E-Commerce Catalog: [Clothing/Wear, Thermal/Warmth, Active/Sports, Outdoor/Rough]
  'coat': [0.90, 0.85, 0.10, 0.40],
  'jacket': [0.92, 0.80, 0.20, 0.50],
  'fleece': [0.88, 0.88, 0.15, 0.30],
  'parka': [0.90, 0.95, 0.10, 0.70],
  'winter': [0.20, 0.95, 0.10, 0.50],
  'warm': [0.10, 0.92, 0.00, 0.10],
  'cozy': [0.20, 0.88, -0.20, -0.20],
  'boots': [0.85, 0.40, 0.60, 0.95],
  'hiking': [0.30, 0.30, 0.90, 0.92],
  'waterproof': [0.40, 0.50, 0.70, 0.95],
  'breathable': [0.80, -0.50, 0.95, 0.20],
  'shirt': [0.95, -0.30, 0.70, 0.10],
  'marathon': [0.20, -0.20, 0.95, 0.40],

  // Movies: [Sci-Fi/Space, Mind-Bending/Complex, Comedy/Humor, Romance/Emotion]
  'interstellar': [0.95, 0.85, -0.40, 0.20],
  'space': [0.98, 0.70, -0.30, -0.10],
  'cosmic': [0.95, 0.75, -0.30, 0.10],
  'movie': [0.50, 0.20, 0.20, 0.20],
  'film': [0.50, 0.20, 0.20, 0.20],
  'mind-bending': [0.70, 0.98, -0.30, -0.10],
  'subconscious': [0.60, 0.95, -0.20, 0.10],
  'comedy': [-0.40, -0.50, 0.98, 0.10],
  'hilarious': [-0.40, -0.60, 0.95, 0.00],
  'funny': [-0.40, -0.50, 0.92, 0.00],
  'romantic': [-0.20, -0.20, 0.10, 0.98],
  'love': [-0.20, -0.30, 0.10, 0.95],
  'paris': [-0.10, -0.10, 0.10, 0.90],
};

/**
 * Generate a 4D dense vector array for any given text query or custom document.
 */
export function generateVector(text: string): number[] {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 0 && !STOP_WORDS.has(w));

  if (words.length === 0) {
    return [0.0, 0.0, 0.0, 0.0];
  }

  const accum = [0, 0, 0, 0];
  let matchedCount = 0;

  for (const word of words) {
    // Exact word or stem match
    let vec: number[] | undefined = FEATURE_DICTIONARY[word];
    if (!vec) {
      // Find closest key prefix/substring match
      const key = Object.keys(FEATURE_DICTIONARY).find(k => word.includes(k) || k.includes(word));
      if (key) vec = FEATURE_DICTIONARY[key];
    }

    if (vec) {
      for (let i = 0; i < 4; i++) {
        accum[i] += vec[i];
      }
      matchedCount++;
    } else {
      // Fallback hash-based vector component for novel words
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = (hash << 5) - hash + word.charCodeAt(i);
        hash |= 0;
      }
      accum[0] += (Math.sin(hash) * 0.5);
      accum[1] += (Math.cos(hash) * 0.5);
      accum[2] += (Math.sin(hash * 2) * 0.5);
      accum[3] += (Math.cos(hash * 2) * 0.5);
      matchedCount++;
    }
  }

  // Normalize vector length (L2 norm)
  const norm = Math.sqrt(accum.reduce((sum, val) => sum + val * val, 0));
  if (norm === 0) return [0.1, 0.1, 0.1, 0.1];

  return accum.map(v => Number((v / norm).toFixed(2)));
}

/**
 * Project a 4D dense vector into 2D canvas coordinates (0 - 100 range).
 */
export function projectVectorTo2D(vector: number[]): { x: number; y: number } {
  const [v1 = 0, v2 = 0, v3 = 0, v4 = 0] = vector;

  // Linear projection combination simulating PCA / t-SNE reduction
  const rawX = (v1 * 0.45 + v2 * 0.45 - v3 * 0.2) * 42;
  const rawY = (v4 * 0.45 + v3 * 0.35 - v1 * 0.15) * 42;

  const x = Math.min(90, Math.max(10, Number((50 + rawX).toFixed(1))));
  const y = Math.min(90, Math.max(10, Number((50 - rawY).toFixed(1)))); // Invert Y for screen display

  return { x, y };
}

/**
 * Calculate Cosine Similarity between two 4D vectors.
 * Returns float between -1.0 and 1.0 (converted to percentage 0 - 100%).
 */
export function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  const similarity = dotProduct / denominator;
  // Convert -1..1 to 0..100 percentage
  const percentage = Math.max(0, similarity) * 100;
  return Number(percentage.toFixed(1));
}

/**
 * Perform client-side Vector Search across an in-memory dataset of documents.
 */
export function performVectorSearch(query: string, docs: Document[]): { queryVector: number[]; queryCoords: { x: number; y: number }; results: VectorSearchResult[] } {
  const queryVector = generateVector(query);
  const queryCoords = projectVectorTo2D(queryVector);

  const results: VectorSearchResult[] = docs.map(doc => {
    const sim = calculateCosineSimilarity(queryVector, doc.vector);

    // Calculate 2D Euclidean distance for visual laser scan radius
    const dx = doc.coords.x - queryCoords.x;
    const dy = doc.coords.y - queryCoords.y;
    const dist2D = Number(Math.sqrt(dx * dx + dy * dy).toFixed(1));

    return {
      doc,
      similarity: sim,
      distance: dist2D,
      rank: 0,
    };
  });

  // Sort descending by Cosine Similarity %
  results.sort((a, b) => b.similarity - a.similarity);

  // Assign ranks
  results.forEach((r, idx) => {
    r.rank = idx + 1;
  });

  return { queryVector, queryCoords, results };
}
