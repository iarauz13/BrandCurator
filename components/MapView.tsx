
import React, { useMemo, useState } from 'react';
import { Store, LocationPin } from '../types';
import { countryCoordinates, cityCoordinates } from '../utils/geoCoordinates';
import { normalizeToKey } from '../utils/normalization';
import WorldMap from './WorldMap';
import { CloseIcon } from './icons/CloseIcon';

interface MapViewProps {
  stores: Store[];
  onClose: () => void;
}

const MapView: React.FC<MapViewProps> = ({ stores, onClose }) => {
  const [currentZoom, setCurrentZoom] = useState(2.5);

  const processedPins = useMemo(() => {
    const cityMap: Record<string, { label: string, stores: Store[] }> = {};
    const countryMap: Record<string, { label: string, stores: Store[] }> = {};

    stores.forEach(store => {
      // THE TRANSFORMATION LAYER: Determine active city/country key
      // Prioritize user field, then AI scraped field
      const rawCity = store.city || store.scraped_data?.city || '';
      const rawCountry = store.country || store.scraped_data?.country || '';

      const cityKey = normalizeToKey(rawCity);
      const countryKey = normalizeToKey(rawCountry);

      const cityCoord = cityKey ? cityCoordinates[cityKey] : null;
      const countryCoord = countryKey ? countryCoordinates[countryKey] : null;

      if (cityCoord) {
        if (!cityMap[cityKey]) cityMap[cityKey] = { label: rawCity || cityKey.replace(/_/g, ' '), stores: [] };
        cityMap[cityKey].stores.push(store);
      } else if (countryCoord) {
        if (!countryMap[countryKey]) countryMap[countryKey] = { label: rawCountry || countryKey.replace(/_/g, ' '), stores: [] };
        countryMap[countryKey].stores.push(store);
      }
    });

    const cityPins: LocationPin[] = Object.entries(cityMap).map(([key, data]) => ({
      lat: cityCoordinates[key].lat,
      lon: cityCoordinates[key].lon,
      count: data.stores.length,
      label: data.label,
      storesInPin: data.stores
    }));

    const regionalPins: (LocationPin & { isFallback: boolean })[] = Object.entries(countryMap).map(([key, data]) => ({
      lat: countryCoordinates[key].lat,
      lon: countryCoordinates[key].lon,
      count: data.stores.length,
      label: `${data.label} (Regional)`,
      storesInPin: data.stores,
      isFallback: true
    }));

    return [...cityPins, ...regionalPins];
  }, [stores]);

  return (
    <div className="bg-brand-surface rounded-2xl border border-brand-border p-4 relative animate-in fade-in duration-700 shadow-xl">
      <button 
        onClick={onClose} 
        className="absolute top-8 right-8 z-[1000] p-3 bg-brand-surface border border-brand-border rounded-full text-brand-text-primary hover:scale-110 transition-all shadow-lg group active:scale-95" 
      >
        <CloseIcon className="group-hover:text-brand-secondary transition-colors" />
      </button>
      
      <div className="w-full h-[70vh] rounded-xl overflow-hidden bg-brand-bg relative border border-brand-border shadow-inner">
        <WorldMap pins={processedPins} onZoomChange={setCurrentZoom} />
      </div>
      
      <div className="text-center mt-6 p-4">
        <h3 className="text-2xl font-bold text-brand-text-primary font-display">Geographic Registry</h3>
        <p className="text-sm text-brand-text-secondary mt-1 max-w-2xl mx-auto leading-relaxed italic">
            Visualizing {stores.length} records. Dark pins indicate precise city hubs; Peach pins represent national regional aggregates.
        </p>
      </div>
    </div>
  );
};

export default MapView;
