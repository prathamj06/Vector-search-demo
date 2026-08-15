# 🔍 Vector vs. Keyword Search — Interactive Visual Educational Tool

An interactive, client-side web application built to visually explain and demonstrate the fundamental architectural differences between **Lexical (Keyword) Search**, **Semantic (Vector) Search**, and **Dual-Method Hybrid Search**.

🌐 **Live Demo Web Application:** [https://vector-search-demo-rho.vercel.app/](https://vector-search-demo-rho.vercel.app/)

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-vector--search--demo--rho.vercel.app-22c55e?style=for-the-badge&logo=vercel)](https://vector-search-demo-rho.vercel.app/)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=for-the-badge&logo=tailwindcss)

> 🔗 **Try it live in your browser:** [vector-search-demo-rho.vercel.app](https://vector-search-demo-rho.vercel.app/)

---

## 📌 What is this Project About?

Traditional search engines rely on **Lexical (Keyword) Search**, which matches exact character strings (e.g., searching for `"speedy dog"` looks literally for `"speedy"` and `"dog"`). When a document uses synonyms like `"quick canine"`, traditional keyword search scores a **0% match** due to its **synonym blind spot**.

Modern AI applications and RAG systems use **Semantic (Vector) Search**. Text is converted into high-dimensional numerical arrays (dense vector embeddings) where semantically related concepts sit close together in geometric space. Vector search uses mathematical metrics like **Cosine Similarity** to retrieve relevant documents regardless of the exact vocabulary used.

Production search systems (like Pinecone, Qdrant, Weaviate, and Elastic) combine both using **Hybrid Search**. This portal lets users interactively explore:
1. **Semantic (Vector) Search** (5-stage visual pipeline)
2. **Lexical (Keyword) Search** (4-step visual breakdown)
3. **Dual-Method Hybrid Search** (Linear $\alpha$-Blend vs. Reciprocal Rank Fusion)
4. **Side-by-Side Comparison Matrix**

---

## ✨ Key Features

### 1. 🔮 Dual-Method Hybrid Search Engine
- **Interactive Algorithm Switcher:** Toggle between **Linear Weighted Combination ($\alpha$-Blend)** and **Reciprocal Rank Fusion (RRF)** in real time.
- **Dynamic $\alpha$-Slider:** Adjust fusion balance smoothly between $100\%$ Keyword $\leftrightarrow$ $50/50$ Balanced $\leftrightarrow$ $100\%$ Vector ($\alpha \in [0.0, 1.0]$).
- **RRF Smoothing Factor ($k$):** Experiment with standard $k=60$, $k=20$, and $k=10$ reciprocal position smoothing.
- **Deep-Dive Educational Analysis:**
  - **Linear Blending Analysis:** Explains the *Scale Calibration Trap* and the *Synonym Penalty* (e.g. searching `"speedy dog"` cuts `"Quick Canine Field Run"` from $92\% \to 46\%$).
  - **RRF Analysis:** Explains rank-based reciprocal score additions, *Score Blindness* (confidence ignorance), and the *Unranked Cliff*.
  - **Side-by-Side Comparison Table:** Compares primary inputs, tuning requirements, synonym handling, and industry use cases.
- **Visual Decomposed Math Cards:** Each document card displays color-coded sub-bars and exact step-by-step equations. Top #1 match is highlighted with an emerald border and a `★ Top Match` badge.

### 2. 🧠 Semantic (Vector) Search Engine — 5-Stage Visual Pipeline
- **Stage 1: Text → Vector Embedding:** Converts any text query into a 4-dimensional normalized dense vector $[v_1, v_2, v_3, v_4]$.
- **Stage 2: Concept Weights ("Inspect the Brain"):** Displays feature activation percentages across domain-specific taxonomy dimensions (e.g., Canine Classification, Speed & Agility, Feline & Predators, Rest & Slumber).
- **Stage 3: 2D Spatial Coordinate Projection:** Projects 4D vectors onto an interactive 2D coordinate canvas grid with solid high-contrast X/Y axis lines. Includes an educational concept callout detailing why 4D Cosine Similarity vector ranking takes precedence over 2D spatial screen compression.
- **Stage 4: Laser Proximity & Nearest-Neighbor Distance Scan:** Measures distance and Cosine Similarity ($S = \frac{A \cdot B}{\|A\| \cdot \|B\|}$) against indexed documents.
- **Stage 5: Raw Vector DB Payload Inspector:** Inspects the exact JSON payload returned by production vector databases (e.g., [Pinecone](https://www.pinecone.io/), [Qdrant](https://qdrant.tech/), [Milvus](https://milvus.io/)) with copy-to-clipboard functionality.

### 3. 📖 Keyword (Lexical) Search Engine — 4-Step Visual Breakdown
- **Step 1: Tokenization:** Splits raw query text into normalized lowercase tokens and identifies stop words.
- **Step 2: Stop-Word Filter:** Discards non-descriptive filler words (`the`, `a`, `is`, `at`) to isolate core search intent.
- **Step 3: Inverted Index Table:** Renders a "back-of-the-book" term-to-document lookup table highlighting active query matches. Scaled to render fully visible without excessive vertical scrolling.
- **Step 4: Lexical Overlap Ranking:** Calculates exact token match percentages and visually demonstrates keyword search failure modes on synonyms.

### 4. ⚖️ Side-by-Side Direct Comparison Matrix
- Renders search rankings from both Keyword and Vector engines simultaneously for the exact same input query.
- Highlights side-by-side score divergence (e.g. Keyword 0% vs Vector 92%).

### 5. 🗄️ Database Portal & Live Corpus Manager
- **Live In-Memory Database:** Accessible via a side drawer or standalone `/corpus` page.
- **Add Custom Documents:** Dynamically add user custom documents; text is immediately tokenized, converted into 4D vectors, and plotted live on the 2D coordinate map.
- **Complete Text Display:** All corpus cards render full titles and un-truncated body text.
- **Prominent Action Affordance:** Features a large, high-visibility `Done Editing — Return to Visualizer` action button in the drawer footer.

### 6. 🛍️ Domain-Specific Datasets & Preset Prompts
- **Animals & Motion:** Explore canine classification, feline predators, movement speed, and resting behavior.
- **E-Commerce Catalog:** Search retail products across outerwear apparel, thermal insulation, and active sports gear.
- **Movie Recommendations:** Find films by plot themes, mood, and genre concepts (Sci-Fi & Cosmic, Mind-Bending, Comedy, Romance).
- **Preset Prompt Chips:** Interactive sample chips with hover popovers explaining prompt goals.

---

## 🛠️ Technology Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Client Components)
- **Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons & UI Utilities:** [Lucide React](https://lucide.dev/), [clsx](https://github.com/lukeed/clsx), [tailwind-merge](https://github.com/dcastil/tailwind-merge)
- **Effects:** [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Type Safety:** [TypeScript 5](https://www.typescriptlang.org/)

---

## 🚀 Getting Started & Live Demo

### 🌐 Live Web Application
Access the deployed production application directly at:
👉 **[https://vector-search-demo-rho.vercel.app/](https://vector-search-demo-rho.vercel.app/)**

### 💻 Local Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/prathamj06/Vector-search-demo.git
   cd "Vector Search Demo"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure & File Links

| Path | Description |
| :--- | :--- |
| [`src/app/page.tsx`](src/app/page.tsx) | Main interactive search visualizer dashboard & tab router |
| [`src/app/corpus/page.tsx`](src/app/corpus/page.tsx) | Standalone Database Portal page (`/corpus`) |
| [`src/components/HybridVisualizer.tsx`](src/components/HybridVisualizer.tsx) | Dual-method hybrid search visualizer ($\alpha$-Blend vs. RRF) |
| [`src/components/VectorVisualizer.tsx`](src/components/VectorVisualizer.tsx) | 5-stage 2D spatial vector search visualizer component |
| [`src/components/KeywordVisualizer.tsx`](src/components/KeywordVisualizer.tsx) | 4-step lexical keyword search visualizer component |
| [`src/components/ComparisonMatrix.tsx`](src/components/ComparisonMatrix.tsx) | Side-by-side search engine comparison view |
| [`src/components/ConceptInfoModal.tsx`](src/components/ConceptInfoModal.tsx) | Viewport-centered React Portal educational modal |
| [`src/components/CorpusDrawer.tsx`](src/components/CorpusDrawer.tsx) | Slide-out Database Portal side drawer |
| [`src/components/CorpusManager.tsx`](src/components/CorpusManager.tsx) | Live in-browser corpus CRUD manager & card list |
| [`src/components/Header.tsx`](src/components/Header.tsx) | Primary top navigation header & search bar |
| [`src/components/ChallengeBanner.tsx`](src/components/ChallengeBanner.tsx) | Contextual prompt challenge bar |
| [`src/components/OnboardingModal.tsx`](src/components/OnboardingModal.tsx) | First-visit interactive walkthrough modal |
| [`src/lib/hybridEngine.ts`](src/lib/hybridEngine.ts) | Linear weighted blend & Reciprocal Rank Fusion (RRF) calculation engine |
| [`src/lib/vectorEngine.ts`](src/lib/vectorEngine.ts) | 4D vector embedding generator & Cosine Similarity calculator |
| [`src/lib/keywordEngine.ts`](src/lib/keywordEngine.ts) | Lexical tokenizer, stop-word filter & inverted index engine |
| [`src/lib/domains.ts`](src/lib/domains.ts) | Domain configurations, taxonomy weights & default datasets |
| [`src/lib/types.ts`](src/lib/types.ts) | Shared TypeScript data models and interfaces |
| [`src/lib/useDocumentStore.ts`](src/lib/useDocumentStore.ts) | Client-side Zustand/localStorage document state hook |
