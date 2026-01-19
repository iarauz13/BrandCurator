
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { LocationPin } from '../types';

interface WorldMapProps {
  pins: (LocationPin & { isFallback?: boolean })[];
  onZoomChange: (zoom: number) => void;
}

const MapEvents: React.FC<{ onZoomChange: (zoom: number) => void }> = ({ onZoomChange }) => {
  const map = useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    }
  });
  return null;
};

const WorldMap: React.FC<WorldMapProps> = ({ pins, onZoomChange }) => {
  const createCustomIcon = (count: number, isFallback?: boolean) => {
    const bgColor = isFallback ? '#eab3a3' : '#1a1a1a';
    return L.divIcon({
      html: `<div class="map-pin" style="background-color: ${bgColor}">${count}</div>`,
      className: 'custom-leaflet-icon',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
  };

  return (
    <>
      <style>{`
        .leaflet-container { background-color: #F8F7F2; }
        .map-pin {
          width: 36px; height: 36px; color: white; border-radius: 50%; border: 2px solid white;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 800; cursor: pointer; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .map-pin:hover { transform: scale(1.15) translateY(-2px); z-index: 1000 !important; }
        .custom-leaflet-icon { background: transparent; border: none; }
        .leaflet-popup-content-wrapper { border-radius: 1.5rem !important; overflow: hidden; }
        .leaflet-popup-content { margin: 0 !important; width: 260px !important; }
      `}</style>
      <MapContainer 
        center={[20, 0]} 
        zoom={2.5} 
        minZoom={2}
        maxZoom={18}
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <MapEvents onZoomChange={onZoomChange} />
        {pins.map((pin, idx) => (
          <Marker
            key={`${pin.label}-${pin.lat}-${pin.lon}-${idx}`}
            position={[pin.lat, pin.lon]}
            icon={createCustomIcon(pin.count, pin.isFallback)}
          >
            <Popup minWidth={260}>
                <div className="bg-brand-surface text-brand-text-primary font-sans">
                  <div className={`p-4 border-b border-brand-border flex items-center justify-between ${pin.isFallback ? 'bg-brand-secondary/10' : 'bg-brand-bg/30'}`}>
                    <h4 className="font-bold text-lg text-brand-primary font-display truncate pr-2">{pin.label}</h4>
                    <span className={`shrink-0 text-[10px] font-black px-2 py-0.5 rounded-full ${pin.isFallback ? 'bg-brand-secondary text-white' : 'bg-brand-primary text-white'}`}>
                      {pin.count} UNITS
                    </span>
                  </div>
                  <div className="p-4">
                    <ul className="space-y-3 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                      {pin.storesInPin.map(store => (
                          <li key={store.id} className="group flex items-center gap-3">
                            <div className={`size-2 shrink-0 rounded-full ${pin.isFallback ? 'bg-brand-secondary' : 'bg-brand-primary'}`}></div>
                            <div className="flex flex-col truncate">
                              <span className="text-sm font-bold text-brand-text-primary truncate">{store.store_name}</span>
                              <span className="text-[9px] uppercase font-bold text-brand-text-secondary opacity-60">{store.city || store.country}</span>
                            </div>
                          </li>
                      ))}
                    </ul>
                  </div>
                </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </>
  );
};

export default WorldMap;
