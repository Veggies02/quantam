import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { CheckCircle2, Clock, RotateCcw, Layers } from 'lucide-react';

export const RealCorridorMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseLayerRef = useRef<L.TileLayer | null>(null);
  const refLayerRef = useRef<L.TileLayer | null>(null);
  const [mapMode, setMapMode] = useState<'dark' | 'satellite'>('dark');

  // Tile layer URLs - 100% Free, No API key, No watermarks!
  const TILES = {
    dark: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    darkRef: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Leaflet Map focused on Indian Ocean Corridor (Chennai to Singapore)
    const map = L.map(mapContainerRef.current, {
      center: [7.8, 92.2],
      zoom: 5,
      minZoom: 3,
      maxZoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // Add Esri Dark Canvas Base Layer (No API Key Required, No Watermarks)
    const baseLayer = L.tileLayer(TILES.dark, {
      maxZoom: 16,
    }).addTo(map);
    baseLayerRef.current = baseLayer;

    // Add Esri Dark Reference Labels Layer
    const refLayer = L.tileLayer(TILES.darkRef, {
      maxZoom: 16,
      opacity: 0.85,
    }).addTo(map);
    refLayerRef.current = refLayer;

    // Zoom control
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Route coordinates: Real maritime shipping lane from Chennai through Andaman & Malacca Strait to Singapore
    const actualRouteCoords: [number, number][] = [
      [13.0827, 80.2707], // Port of Chennai
      [12.15, 83.2],
      [10.8, 86.4],
      [9.5, 89.8],
      [8.7, 92.5],       // MV Meridian Current Position (Andaman Sea)
    ];

    const plannedRemainingCoords: [number, number][] = [
      [8.7, 92.5],       // MV Meridian
      [7.2, 95.1],       // Entrance to Malacca Strait
      [5.6, 97.4],
      [4.1, 99.2],
      [2.5, 101.8],      // Port Klang / Malacca channel
      [1.3521, 103.8198] // Port of Singapore
    ];

    // Traversed path (Actual Track - Solid Emerald with subtle glow)
    L.polyline(actualRouteCoords, {
      color: '#10B981',
      weight: 3.5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // Planned path (Dashed Cyan)
    L.polyline(plannedRemainingCoords, {
      color: '#00E5FF',
      weight: 3,
      opacity: 0.9,
      dashArray: '6, 6',
      lineCap: 'round',
    }).addTo(map);

    // 1. Port of Chennai Marker
    const chennaiIcon = L.divIcon({
      className: 'custom-port-marker',
      html: `
        <div style="display:flex; flex-direction:column; align-items:center; transform:translate(-50%, -50%);">
          <div style="height:12px; width:12px; border-radius:50%; background:#10B981; border:2px solid #06141D; box-shadow:0 0 10px #10B981;"></div>
          <span style="font-size:10px; font-weight:600; color:#E2E8F0; text-shadow:0 1px 4px rgba(0,0,0,0.9); margin-top:3px;">Chennai</span>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
    L.marker([13.0827, 80.2707], { icon: chennaiIcon }).addTo(map).bindPopup(`
      <div style="font-family:sans-serif;">
        <div style="font-weight:bold; color:#10B981; font-size:12px;">Port of Chennai (Origin)</div>
        <div style="font-size:10px; color:#94A3B8; margin-top:2px;">Departed: 16 Nov 2025 · 08:30 UTC</div>
        <div style="font-size:10px; color:#E2E8F0; margin-top:4px;">Berth: Container Terminal 2</div>
      </div>
    `);

    // 2. Port of Singapore Marker
    const singaporeIcon = L.divIcon({
      className: 'custom-port-marker',
      html: `
        <div style="display:flex; flex-direction:column; align-items:center; transform:translate(-50%, -50%);">
          <div style="height:12px; width:12px; border-radius:50%; background:#00E5FF; border:2px solid #06141D; box-shadow:0 0 10px #00E5FF;"></div>
          <span style="font-size:10px; font-weight:600; color:#E2E8F0; text-shadow:0 1px 4px rgba(0,0,0,0.9); margin-top:3px;">Singapore</span>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
    L.marker([1.3521, 103.8198], { icon: singaporeIcon }).addTo(map).bindPopup(`
      <div style="font-family:sans-serif;">
        <div style="font-weight:bold; color:#00E5FF; font-size:12px;">Port of Singapore (Destination)</div>
        <div style="font-size:10px; color:#94A3B8; margin-top:2px;">ETA: 28 Nov 2025 · 14:00 UTC</div>
        <div style="font-size:10px; color:#E2E8F0; margin-top:4px;">Terminal: PSA Tuas Megaport</div>
      </div>
    `);

    // 3. MV Meridian Current Position Marker
    const vesselIcon = L.divIcon({
      className: 'custom-vessel-marker',
      html: `
        <div style="position:relative; display:flex; flex-direction:column; align-items:center; transform:translate(-50%, -50%);">
          <div style="position:absolute; top:-6px; left:-6px; height:24px; width:24px; border-radius:50%; border:1.5px solid #00E5FF; opacity:0.75; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="height:14px; width:14px; border-radius:50%; background:#00E5FF; border:2.5px solid #06141D; box-shadow:0 0 12px #00E5FF;">
          </div>
          <div style="background:#06141D; border:1px solid #00E5FF; border-radius:4px; padding:2px 6px; margin-top:4px; white-space:nowrap; box-shadow:0 2px 8px rgba(0,0,0,0.8);">
            <span style="font-size:9px; font-weight:700; color:#00E5FF; letter-spacing:0.3px;">MV Meridian (Current)</span>
          </div>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    const vesselMarker = L.marker([8.7, 92.5], { icon: vesselIcon }).addTo(map);
    vesselMarker.bindPopup(`
      <div style="font-family:sans-serif; min-width:180px;">
        <div style="font-weight:bold; color:#00E5FF; font-size:12px; display:flex; align-items:center; justify-content:space-between;">
          <span>MV Meridian</span>
          <span style="font-size:9px; background:rgba(0,229,255,0.15); color:#00E5FF; padding:1px 5px; border-radius:4px;">LIVE AIS</span>
        </div>
        <div style="border-top:1px solid #1E293B; margin:6px 0; padding-top:6px; font-size:10px; line-height:1.6; color:#CBD5E1;">
          <div><strong>Position:</strong> 8.7°N, 92.5°E (Andaman Sea)</div>
          <div><strong>Speed:</strong> 15.1 knots (Speed made good)</div>
          <div><strong>Heading:</strong> 124° True</div>
          <div><strong>Fuel Consumption:</strong> 42.1 t/day</div>
          <div><strong>Fuel Blend:</strong> Green Ammonia (B30)</div>
          <div><strong>Schedule Status:</strong> 96% On-Time</div>
        </div>
      </div>
    `);

    // Auto-fit bounds
    map.fitBounds([
      [14.2, 79.5],
      [0.8, 104.5]
    ], { padding: [25, 25] });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const handleToggleLayer = () => {
    if (!mapInstanceRef.current || !baseLayerRef.current) return;

    if (mapMode === 'dark') {
      baseLayerRef.current.setUrl(TILES.satellite);
      if (refLayerRef.current) refLayerRef.current.setOpacity(0.5);
      setMapMode('satellite');
    } else {
      baseLayerRef.current.setUrl(TILES.dark);
      if (refLayerRef.current) refLayerRef.current.setOpacity(0.85);
      setMapMode('dark');
    }
  };

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds([
        [14.2, 79.5],
        [0.8, 104.5]
      ], { padding: [25, 25] });
    }
  };

  return (
    <div className="lg:col-span-2 bg-[#06141D] rounded-xl p-5 border border-slate-800 shadow-sm text-white flex flex-col justify-between min-h-[360px] relative overflow-hidden">
      {/* Header & Status Indicator */}
      <div className="flex items-start justify-between z-10">
        <div>
          <div className="text-xs font-semibold text-white">Voyage Route &amp; Live Position</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Planned route, current position, and key waypoints along Indian Ocean corridor.
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-[11px] text-slate-300 bg-[#0A1D2A] px-2.5 py-1 rounded-md border border-slate-700/60">
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-3 bg-[#00E5FF]"></span> Planned Route
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-3 bg-[#10B981]"></span> Actual Route
            </span>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3" />
            ETA &amp; Schedule: 96% On-Time
          </span>
        </div>
      </div>

      {/* Real Interactive Leaflet Nautical Map Container */}
      <div className="relative w-full h-[200px] my-3 rounded-lg overflow-hidden border border-slate-800/80 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Map Control Buttons: Reset & Toggle Satellite */}
        <div className="absolute bottom-2 left-2 z-[400] flex items-center gap-1.5">
          <button
            onClick={handleResetView}
            title="Reset Corridor View"
            className="bg-[#0A1D2A]/90 hover:bg-[#0A1D2A] text-slate-300 hover:text-white border border-slate-700/80 rounded px-2 py-1 text-[10px] flex items-center gap-1 shadow-md transition-all backdrop-blur-xs"
          >
            <RotateCcw className="h-2.5 w-2.5" />
            <span>Reset View</span>
          </button>

          <button
            onClick={handleToggleLayer}
            title="Switch Map Style"
            className="bg-[#0A1D2A]/90 hover:bg-[#0A1D2A] text-slate-300 hover:text-white border border-slate-700/80 rounded px-2 py-1 text-[10px] flex items-center gap-1 shadow-md transition-all backdrop-blur-xs"
          >
            <Layers className="h-2.5 w-2.5 text-cyan-400" />
            <span>{mapMode === 'dark' ? 'Satellite' : 'Dark Nautical'}</span>
          </button>
        </div>

        {/* Clean Live GIS Status Indicator */}
        <div className="absolute top-2 left-2 z-[400] bg-[#06141D]/90 border border-slate-700/70 text-slate-300 rounded px-2 py-0.5 text-[9px] font-mono flex items-center gap-1.5 backdrop-blur-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Live Marine GIS: Esri Ocean &amp; Nautical Dark</span>
        </div>
      </div>

      {/* 4 Bottom Delta Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-3 border-t border-slate-800 text-xs z-10">
        <div>
          <div className="text-[10px] text-slate-400 font-medium">Fuel Consumption</div>
          <div className="flex items-center gap-1 text-emerald-400 font-bold mt-0.5 font-mono">
            <span>&darr; -8.2%</span>
          </div>
          <div className="text-[10px] text-slate-500">vs planned baseline</div>
        </div>

        <div>
          <div className="text-[10px] text-slate-400 font-medium">Average Speed</div>
          <div className="flex items-center gap-1 text-white font-bold mt-0.5 font-mono">
            <span>15.1 kn avg</span>
            <span className="text-[10px] text-emerald-400 font-sans font-normal">(+3.1%)</span>
          </div>
          <div className="text-[10px] text-slate-500">Speed over ground</div>
        </div>

        <div>
          <div className="text-[10px] text-slate-400 font-medium">CO₂ Emissions (WtW)</div>
          <div className="flex items-center gap-1 text-emerald-400 font-bold mt-0.5 font-mono">
            <span>&darr; -11.6%</span>
          </div>
          <div className="text-[10px] text-slate-500">Green Ammonia blend</div>
        </div>

        <div>
          <div className="text-[10px] text-slate-400 font-medium">ETA Deviation</div>
          <div className="flex items-center gap-1 text-amber-400 font-bold mt-0.5 font-mono">
            <Clock className="h-3 w-3 inline" />
            <span>+2.4 hrs</span>
          </div>
          <div className="text-[10px] text-slate-500">within safe buffer</div>
        </div>
      </div>
    </div>
  );
};
