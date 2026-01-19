
import { GoogleGenAI, Type } from '@google/genai';
import { Store, CategorizedStore } from '../types';
import { CollectionTemplate } from '../collectionTemplates';
import { logger } from '../utils/logger';

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && error?.message?.includes('429')) {
      logger.log('warn', `Gemini rate limited. Retrying in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const generateAestheticImage = async (store: Store): Promise<string> => {
    const startTime = performance.now();
    const model = 'gemini-2.5-flash-image';
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let prompt = `Generate a sophisticated editorial photo for "${store.store_name}". Style: minimalist, soft lighting.`;

    try {
        const response = await withRetry(async () => {
            return await ai.models.generateContent({
                model,
                contents: { parts: [{ text: prompt }] },
                config: {
                    imageConfig: {
                        aspectRatio: "16:9"
                    }
                }
            });
        });
        
        const duration = performance.now() - startTime;
        logger.log('perf', `Gemini Image Generation: ${store.store_name}`, null, duration);

        const parts = response.candidates?.[0]?.content?.parts;
        if (parts) {
            for (const part of parts) {
                if (part.inlineData) {
                    return part.inlineData.data;
                }
            }
        }
        throw new Error("No image data found in response.");
    } catch (error) {
        logger.log('error', `Gemini Image Failed: ${store.store_name}`, error);
        throw error;
    }
};

export const findSimilarAestheticBrands = async (
  anchorStore: Store,
  candidates: Store[],
  count: number = 3
): Promise<string[]> => {
  if (!anchorStore.description || candidates.length === 0) return [];
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const context = candidates.map(s => ({
    id: s.id,
    name: s.store_name,
    description: s.description,
    tags: s.tags.join(', ')
  }));

  const prompt = `
    Analyze the "Aesthetic DNA" of the anchor brand:
    Name: "${anchorStore.store_name}"
    Description: "${anchorStore.description}"
    Tags: "${anchorStore.tags.join(', ')}"

    Identify top ${count} IDs with similar vibe. Return JSON array.
    Candidates: ${JSON.stringify(context)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return response.text ? JSON.parse(response.text) : [];
  } catch (err) {
    console.error(err);
    return [];
  }
};

/**
 * AI Enrichment Engine: Uses real-time search to find missing brand details.
 * Requirement: Uses gemini-3-pro-image-preview for Search Grounding tool.
 */
export const enrichStoreData = async (store: Store): Promise<{ website?: string, description?: string, sources?: string[] }> => {
  const startTime = performance.now();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Requirement: Luxury Archivist persona + Strict Search rules
  const prompt = `
    Act as a luxury brand archivist. Use Google Search to find the official website URL and a professional, 1-sentence editorial description for the brand: "${store.store_name}" located in ${store.city || 'unknown city'}, ${store.country || 'unknown country'}.

    Requirements:
    1. The description must be high-end, editorial, and exactly 1 sentence (max 150 words).
    2. If the official website cannot be determined with 100% certainty, leave the field empty.
    3. Return ONLY the JSON.

    Format: {"website": "url", "description": "text"}
  `;

  try {
    const response = await withRetry(async () => {
      return await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              website: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ['website', 'description']
          }
        }
      });
    });

    const duration = performance.now() - startTime;
    logger.log('perf', `Gemini Enrichment: ${store.store_name}`, null, duration);

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
    throw new Error("No data returned from AI.");
  } catch (error: any) {
    logger.log('error', `Enrichment Failed: ${store.store_name}`, error.message);
    throw error;
  }
};

export const scrapeStoreData = async (websiteUrl: string, template: CollectionTemplate): Promise<Partial<Store> | null> => {
  const startTime = performance.now();
  try {
    const response = await fetch('/api/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urlToScrape: websiteUrl, template }),
    });
    const duration = performance.now() - startTime;
    if (!response.ok) return null;
    logger.log('perf', `Scrape Success: ${websiteUrl}`, null, duration);
    return await response.json();
  } catch (error) {
    return null;
  }
};
