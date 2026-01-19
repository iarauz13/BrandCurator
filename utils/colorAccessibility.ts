/**
 * Parses a hex color string into its RGB components.
 * Supports formats like #RGB and #RRGGBB.
 * @param hex - The hex color string.
 * @returns An object with r, g, b properties (0-255), or null if invalid.
 */
const parseHexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  if (!hex || hex.charAt(0) !== '#') {
    return null;
  }

  let hexValue = hex.substring(1);

  // Handle shorthand hex format (e.g., #03F)
  if (hexValue.length === 3) {
    hexValue = hexValue.split('').map(char => char + char).join('');
  }

  if (hexValue.length !== 6) {
    return null;
  }

  const r = parseInt(hexValue.substring(0, 2), 16);
  const g = parseInt(hexValue.substring(2, 4), 16);
  const b = parseInt(hexValue.substring(4, 6), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return null;
  }

  return { r, g, b };
};

/**
 * Calculates the optimal text color (black or white) for a given background color
 * based on perceived brightness/luminance.
 * @param backgroundColor - The background color in hex format (e.g., '#FFC300').
 * @returns The hex code for the optimal text color ('#000000' or '#FFFFFF').
 */
export const getOptimalTextColor = (backgroundColor: string): string => {
  const rgb = parseHexToRgb(backgroundColor);

  // Default to white for invalid colors
  if (!rgb) {
    return '#FFFFFF';
  }

  // Calculate relative luminance using the same gamma correction as before
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(v => {
    const val = v / 255;
    if (val <= 0.03928) {
      return val / 12.92;
    } else {
      return Math.pow((val + 0.055) / 1.055, 2.4);
    }
  });

  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  // Use a threshold approach: if luminance > 0.179, use black text, otherwise white
  // 0.179 is approximately the midpoint for optimal contrast
  return luminance > 0.179 ? '#000000' : '#FFFFFF';
};