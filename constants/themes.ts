
import { ThemeConfig } from '../types';

/**
 * Curated Theme Library.
 * 
 * Architectural Choice: 
 * We use 5 specific high-end gradients.
 * Instead of generic grey text (#6b7280) or reducing white opacity, 
 * we use 'textSecondary' colors that are specific tints derived from the 
 * background to create hierarchy while maintaining vibrancy and richness.
 */
export const THEME_PRESETS: ThemeConfig[] = [
  {
    id: 'champagne-pearl',
    name: 'Champagne & Pearl',
    background: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)',
    accent: '#854d0e',
    textOnAccent: '#FFFFFF',
    textPrimary: '#4a3728',
    textSecondary: '#8a7161',
    isDarkBackground: false
  },
  {
    id: 'midnight-silk',
    name: 'Midnight Silk',
    background: 'linear-gradient(to top, #09203f 0%, #537895 100%)',
    accent: '#38bdf8',
    textOnAccent: '#0f172a',
    textPrimary: '#e0f2fe',
    textSecondary: '#7dd3fc',
    isDarkBackground: true
  },
  {
    id: 'morning-mist',
    name: 'Morning Mist',
    background: 'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)',
    accent: '#6d28d9',
    textOnAccent: '#FFFFFF',
    textPrimary: '#1e1b4b',
    textSecondary: '#4338ca',
    isDarkBackground: false
  },
  {
    id: 'desert-dusk',
    name: 'Desert Dusk',
    background: 'linear-gradient(70deg, #d9a7c7 0%, #fffcdc 100%)',
    accent: '#be185d',
    textOnAccent: '#FFFFFF',
    textPrimary: '#500724',
    textSecondary: '#9d174d',
    isDarkBackground: false
  },
  {
    id: 'cool-slate',
    name: 'Cool Slate',
    background: 'linear-gradient(to right, #434343 0%, #000000 100%)',
    accent: '#f4f4f5',
    textOnAccent: '#000000',
    textPrimary: '#ffffff',
    textSecondary: '#a1a1aa',
    isDarkBackground: true
  }
];

export const DEFAULT_THEME = THEME_PRESETS[0];
