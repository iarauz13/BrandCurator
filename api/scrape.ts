
import { GoogleGenAI } from '@google/genai';
import { CollectionTemplate } from '../collectionTemplates';

interface ApiRequest {
  body: {
    urlToScrape?: string;
    template?: CollectionTemplate;
  };
  method?: string;
}

interface ApiResponse {
  status: (code: number) => {
    json: (data: any) => void;
  };
}

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

const getTextFromHtml = (html: string): string => {
  let cleanHtml = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
  const bodyMatch = cleanHtml.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  const text = (bodyMatch ? bodyMatch[1] : cleanHtml).replace(/<[^>]+>/g, ' ');
  return text.replace(/\s\s+/g, ' ').trim();
};

const buildDynamicPrompt = (text: string, template: CollectionTemplate): string => {
  const dynamicFields = template.fields.map(field => 
    `- "${field.label}": An array of strings from these options: [${field.options.map(o => `"${o}"`).join(', ')}]. Be accurate.`
  ).join('\n');

  return `
    You are an AI assistant for a collection app.
    Analyze the following text from a website and return a JSON object with:
    - "description": A concise summary (max 100 words).
    - "country": The brand's origin country (normalized lowercase with underscores if it matches a known nation).
    - "city": The primary city (normalized lowercase with underscores).
    - "instagram_name": The IG handle without @.
    - "customFields": An object containing the following keys:
      ${dynamicFields}

    Text:
    ${text.substring(0, 15000)}

    Return ONLY the raw JSON object, without any markdown formatting.
  `;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { urlToScrape, template } = req.body;
  if (!urlToScrape || !template) {
    return res.status(400).json({ error: 'URL and a collection template are required' });
  }
  if (!SCRAPER_API_KEY) {
    return res.status(500).json({ error: 'Server configuration error: Missing scraping API key.' });
  }

  try {
    const scrapeUrl = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(urlToScrape)}&render=true`;
    const scrapeResponse = await fetch(scrapeUrl);
    if (!scrapeResponse.ok) throw new Error(`Failed to scrape: ${scrapeResponse.statusText}`);
    const html = await scrapeResponse.text();
    const cleanText = getTextFromHtml(html);
    
    const prompt = buildDynamicPrompt(cleanText, template);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const jsonStr = geminiResponse.text?.trim();
    if (!jsonStr) {
      throw new Error("The model returned an empty response.");
    }
    
    const scrapedData = JSON.parse(jsonStr);
    res.status(200).json(scrapedData);

  } catch (error: any) {
    console.error('Scraping/AI error:', error);
    res.status(500).json({ error: error.message || 'An unknown error occurred.' });
  }
}
