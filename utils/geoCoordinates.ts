
/**
 * Normalized Geographic Dictionary
 * Keys are generated using normalizeToKey() to ensure case-insensitive 
 * and symbol-agnostic matching.
 */

export const countryCoordinates: Record<string, { lat: number, lon: number }> = {
    // North America
    'usa': { lat: 39.8283, lon: -98.5795 },
    'united_states': { lat: 39.8283, lon: -98.5795 },
    'united_states_of_america': { lat: 39.8283, lon: -98.5795 },
    'us': { lat: 39.8283, lon: -98.5795 },
    'canada': { lat: 56.1304, lon: -106.3468 },
    'mexico': { lat: 23.6345, lon: -102.5528 },
    
    // Europe
    'denmark': { lat: 56.2639, lon: 9.5018 },
    'sweden': { lat: 60.1282, lon: 18.6435 },
    'norway': { lat: 60.4720, lon: 8.4689 },
    'france': { lat: 46.2276, lon: 2.2137 },
    'germany': { lat: 51.1657, lon: 10.4515 },
    'italy': { lat: 41.8719, lon: 12.5674 },
    'spain': { lat: 40.4637, lon: -3.7492 },
    'portugal': { lat: 39.3999, lon: -8.2245 },
    'united_kingdom': { lat: 55.3781, lon: -3.4360 },
    'uk': { lat: 55.3781, lon: -3.4360 },
    'netherlands': { lat: 52.1326, lon: 5.2913 },
    'belgium': { lat: 50.5039, lon: 4.4699 },
    'switzerland': { lat: 46.8182, lon: 8.2275 },
    'austria': { lat: 47.5162, lon: 14.5501 },
    'greece': { lat: 39.0742, lon: 21.8243 },
    'ireland': { lat: 53.4129, lon: -8.2439 },
    'finland': { lat: 61.9241, lon: 25.7482 },
    
    // Asia/Oceania
    'australia': { lat: -25.2744, lon: 133.7751 },
    'new_zealand': { lat: -40.9006, lon: 174.8860 },
    'japan': { lat: 36.2048, lon: 138.2529 },
    'south_korea': { lat: 35.9078, lon: 127.7669 },
    'china': { lat: 35.8617, lon: 104.1954 },
    'hong_kong': { lat: 22.3193, lon: 114.1694 },
    'singapore': { lat: 1.3521, lon: 103.8198 },
    'thailand': { lat: 15.8700, lon: 100.9925 },
    'vietnam': { lat: 14.0583, lon: 108.2772 },
    'india': { lat: 20.5937, lon: 78.9629 },
    'indonesia': { lat: -0.7893, lon: 113.9213 },
    
    // Middle East / Africa
    'uae': { lat: 23.4241, lon: 53.8478 },
    'israel': { lat: 31.0461, lon: 34.8516 },
    'south_africa': { lat: -30.5595, lon: 22.9375 },
    'morocco': { lat: 31.7917, lon: -7.0926 },
    'egypt': { lat: 26.8206, lon: 30.8025 }
};

export const cityCoordinates: Record<string, { lat: number, lon: number }> = {
    // North America
    'san_francisco': { lat: 37.7749, lon: -122.4194 },
    'ventura': { lat: 34.2746, lon: -119.2290 },
    'new_york': { lat: 40.7128, lon: -74.0060 },
    'nyc': { lat: 40.7128, lon: -74.0060 },
    'brooklyn': { lat: 40.6782, lon: -73.9442 },
    'los_angeles': { lat: 34.0522, lon: -118.2437 },
    'la': { lat: 34.0522, lon: -118.2437 },
    'chicago': { lat: 41.8781, lon: -87.6298 },
    'miami': { lat: 25.7617, lon: -80.1918 },
    'austin': { lat: 30.2672, lon: -97.7431 },
    'portland': { lat: 45.5152, lon: -122.6784 },
    'seattle': { lat: 47.6062, lon: -122.3321 },
    'toronto': { lat: 43.6532, lon: -79.3832 },
    'vancouver': { lat: 49.2827, lon: -123.1207 },
    'montreal': { lat: 45.5017, lon: -73.5673 },
    'mexico_city': { lat: 19.4326, lon: -99.1332 },
    
    // Europe
    'copenhagen': { lat: 55.6761, lon: 12.5683 },
    'stockholm': { lat: 59.3293, lon: 18.0686 },
    'oslo': { lat: 59.9139, lon: 10.7522 },
    'london': { lat: 51.5074, lon: -0.1278 },
    'paris': { lat: 48.8566, lon: 2.3522 },
    'berlin': { lat: 52.5200, lon: 13.4050 },
    'munich': { lat: 48.1351, lon: 11.5820 },
    'milan': { lat: 45.4642, lon: 9.1900 },
    'rome': { lat: 41.9028, lon: 12.4964 },
    'madrid': { lat: 40.4168, lon: -3.7038 },
    'barcelona': { lat: 41.3851, lon: 2.1734 },
    'amsterdam': { lat: 52.3676, lon: 4.9041 },
    'antwerp': { lat: 51.2194, lon: 4.4025 },
    'brussels': { lat: 50.8503, lon: 4.3517 },
    'vienna': { lat: 48.2082, lon: 16.3738 },
    'zurich': { lat: 47.3769, lon: 8.5417 },
    'lisbon': { lat: 38.7223, lon: -9.1393 },
    'dublin': { lat: 53.3498, lon: -6.2603 },
    'helsinki': { lat: 60.1699, lon: 24.9384 },
    'athens': { lat: 37.9838, lon: 23.7275 },
    'reverb': { lat: 52.5200, lon: 13.4050 }, // Generic for Berlin context
    
    // Oceania
    'sydney': { lat: -33.8688, lon: 151.2093 },
    'melbourne': { lat: -37.8136, lon: 144.9631 },
    'auckland': { lat: -36.8485, lon: 174.7633 },
    'brisbane': { lat: -27.4698, lon: 153.0251 },
    
    // Asia
    'tokyo': { lat: 35.6895, lon: 139.6917 },
    'kyoto': { lat: 35.0116, lon: 135.7681 },
    'osaka': { lat: 34.6937, lon: 135.5023 },
    'seoul': { lat: 37.5665, lon: 126.9780 },
    'shanghai': { lat: 31.2304, lon: 121.4737 },
    'beijing': { lat: 39.9042, lon: 116.4074 },
    'hong_kong': { lat: 22.3193, lon: 114.1694 },
    'singapore': { lat: 1.3521, lon: 103.8198 },
    'bangkok': { lat: 13.7563, lon: 100.5018 },
    'mumbai': { lat: 19.0760, lon: 72.8777 },
    'delhi': { lat: 28.6139, lon: 77.2090 },
    'bali': { lat: -8.3405, lon: 115.0920 },
    
    // Other
    'dubai': { lat: 25.2048, lon: 55.2708 },
    'tel_aviv': { lat: 32.0853, lon: 34.7818 },
    'cape_town': { lat: -33.9249, lon: 18.4241 },
    'johannesburg': { lat: -26.2041, lon: 28.0473 },
    'marrakech': { lat: 31.6295, lon: -7.9811 },
    'cairo': { lat: 30.0444, lon: 31.2357 }
};
