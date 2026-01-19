
import { parseCSV } from './csvParser';

/**
 * CSV Processing Web Worker
 * Offloads heavy parsing and normalization logic from the main thread.
 */
self.onmessage = (e: MessageEvent) => {
  const { csvText, template } = e.data;
  
  try {
    const result = parseCSV(csvText, template);
    self.postMessage({ type: 'SUCCESS', result });
  } catch (error: any) {
    self.postMessage({ type: 'ERROR', message: error.message });
  }
};
