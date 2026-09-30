import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { RotateCcw, Layers } from 'lucide-react';

interface PortNode {
  id: string;
  name: string;
  coords: [number, number];
  country: string;
  cargoVolume: string;
  activeVessels: number;
}

const PORTS: PortNode[] = [
  { id: 'dubai', name: 'Dubai', coords: [25.2048, 55.2708], country: 'UAE', cargoVolume: '14.2M TEU', activeVessels: 4 },
  { id: 'mundra', name: 'Mundra', coords: [22.8394, 69.7042], country: 'India', cargoVolume: '7.5M TEU', activeVessels: 3 },
  { id: 'mumbai', name: 'Mumbai', coords: [18.9438, 72.8389], country: 'India', cargoVolume: '5.2M TEU', activeVessels: 6 },
  { id: 'mormugao', name: 'Mormugao', coords: [15.4124, 73.8016], country: 'India', cargoVolume: '18.4M MT', activeVessels: 2 },
  { id: 'kochi', name: 'Kochi', coords: [9.9674, 76.2427], country: 'India', cargoVolume: '4.8M TEU', activeVessels: 3 },
  { id: 'chennai', name: 'Chennai', coords: [13.0827, 80.2707], country: 'India', cargoVolume: '6.1M TEU', activeVessels: 5 },
  { id: 'kolkata', name: 'Kolkata', coords: [22.5726, 88.3639], country: 'India', cargoVolume: '3.9M TEU', activeVessels: 2 },
  { id: 'portblair', name: 'Port Blair', coords: [11.6234, 92.7265], country: 'India', cargoVolume: '1.2M MT', activeVessels: 2 },
  { id: 'singapore', name: 'Singapore', coords: [1.3521, 103.8198], country: 'Singapore', cargoVolume: '39.0M TEU', activeVessels: 8 },
];

export const RealNetworkMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseLayerRef = useRef<L.TileLayer | null>(null);
  const refLayerRef = useRef<L.TileLayer | null>(null);
  const [mapMode, setMapMode] = useState<'dark' | 'satellite'>('dark');

  // 100% Free, Zero API Key, Zero Watermark Esri Map Tiles
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

    // Initialize Map focused on Northern Indian Ocean & Corridors
    const map = L.map(mapContainerRef.current, {
      center: [14.0, 78.0],
      zoom: 4,
      minZoom: 3,
      maxZoom: 12,
      zoomControl: false,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // Base Layer
    const baseLayer = L.tileLayer(TILES.dark, { maxZoom: 16 }).addTo(map);
    baseLayerRef.current = baseLayer;

    // Reference Labels Layer
    const refLayer = L.tileLayer(TILES.darkRef, { maxZoom: 16, opacity: 0.85 }).addTo(map);
    refLayerRef.current = refLayer;

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Realistic Sea Lanes following maritime navigation channels
    const routes = [
      // 1. Dubai -> Mundra (LNG - Cyan)
      {
        path: [[25.20, 55.27], [24.5, 58.2], [23.5, 64.0], [22.84, 69.70]],
        color: '#00E5FF',
        weight: 3,
        fuel: 'LNG',
        desc: 'Dubai – Mundra Trunk'
      },
      // 2. Dubai -> Mumbai (LNG - Cyan)
      {
        path: [[25.20, 55.27], [23.8, 59.5], [21.2, 66.8], [18.94, 72.84]],
        color: '#00E5FF',
        weight: 2.5,
        fuel: 'LNG',
        desc: 'Dubai – Mumbai Energy Corridor'
      },
      // 3. Mundra -> Mumbai (LNG - Cyan, heavy cargo)
      {
        path: [[22.84, 69.70], [21.5, 70.2], [19.8, 72.0], [18.94, 72.84]],
        color: '#00E5FF',
        weight: 3.5,
        fuel: 'LNG',
        desc: 'Mundra – Mumbai Coastal Feed'
      },
      // 4. Mumbai -> Mormugao (Methanol - Purple)
      {
        path: [[18.94, 72.84], [17.2, 73.1], [15.41, 73.80]],
        color: '#C084FC',
        weight: 2.5,
        fuel: 'Methanol',
        desc: 'Mumbai – Mormugao Chemical Run'
      },
      // 5. Mormugao -> Kochi (HFO - Slate)
      {
        path: [[15.41, 73.80], [13.2, 74.5], [11.2, 75.3], [9.97, 76.24]],
        color: '#94A3B8',
        weight: 2,
        fuel: 'HFO',
        desc: 'Mormugao – Kochi Bulk Lane'
      },
      // 6. Kochi -> Chennai (Ammonia - Emerald, around Sri Lanka)
      {
        path: [[9.97, 76.24], [7.8, 77.2], [6.2, 79.5], [6.1, 81.8], [8.5, 82.2], [11.0, 81.2], [13.08, 80.27]],
        color: '#10B981',
        weight: 2.5,
        fuel: 'Ammonia',
        desc: 'Kochi – Chennai Trans-Peninsular'
      },
      // 7. Chennai -> Kolkata (LNG - Cyan, heavy cargo)
      {
        path: [[13.08, 80.27], [16.2, 82.8], [19.2, 86.0], [21.0, 87.8], [22.57, 88.36]],
        color: '#00E5FF',
        weight: 3.5,
        fuel: 'LNG',
        desc: 'Chennai – Kolkata Main Express'
      },
      // 8. Kolkata -> Port Blair (Ammonia - Emerald)
      {
        path: [[22.57, 88.36], [19.5, 89.2], [15.2, 91.0], [11.62, 92.73]],
        color: '#10B981',
        weight: 2.5,
        fuel: 'Ammonia',
        desc: 'Kolkata – Port Blair Feeder'
      },
      // 9. Chennai -> Port Blair (Methanol - Purple)
      {
        path: [[13.08, 80.27], [12.6, 85.0], [12.0, 89.0], [11.62, 92.73]],
        color: '#C084FC',
        weight: 2.5,
        fuel: 'Methanol',
        desc: 'Chennai – Port Blair Direct'
      },
      // 10. Port Blair -> Singapore (LNG - Cyan, heavy cargo)
      {
        path: [[11.62, 92.73], [8.5, 95.0], [5.6, 98.2], [3.2, 101.0], [1.35, 103.82]],
        color: '#00E5FF',
        weight: 3.5,
        fuel: 'LNG',
        desc: 'Port Blair – Singapore Straits Gateway'
      },
      // 11. Chennai -> Singapore (Ammonia - Emerald, Direct Corridor)
      {
        path: [[13.08, 80.27], [10.5, 86.0], [7.5, 93.5], [4.5, 99.0], [1.35, 103.82]],
        color: '#10B981',
        weight: 2.5,
        fuel: 'Ammonia',
        desc: 'Chennai – Singapore Green Corridor'
      },
    ];

    // Render Polylines
    routes.forEach(r => {
      const pl = L.polyline(r.path as [number, number][], {
        color: r.color,
        weight: r.weight,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      pl.bindPopup(`
        <div style="font-family:sans-serif;">
          <div style="font-weight:bold; color:${r.color}; font-size:11px;">${r.desc}</div>
          <div style="font-size:10px; color:#94A3B8; margin-top:2px;">Primary Fuel: <strong>${r.fuel}</strong></div>
        </div>
      `);
    });

    // Render Glowing Port Nodes
    PORTS.forEach(port => {
      const portIcon = L.divIcon({
        className: 'custom-port-node',
        html: `
          <div style="position:relative; display:flex; flex-direction:column; align-items:center; transform:translate(-50%, -50%); cursor:pointer;">
            <div style="position:absolute; top:-4px; left:-4px; height:20px; width:20px; border-radius:50%; background:#00E5FF; opacity:0.25; filter:blur(2px);"></div>
            <div style="height:12px; width:12px; border-radius:50%; background:#06141D; border:2px solid #00E5FF; box-shadow:0 0 8px #00E5FF; display:flex; align-items:center; justify-content:center;">
              <div style="height:4px; width:4px; border-radius:50%; background:#00E5FF;"></div>
            </div>
            <span style="font-size:9px; font-weight:700; color:#E2E8F0; text-shadow:0 1px 3px rgba(0,0,0,0.95); margin-top:3px; letter-spacing:0.2px;">
              ${port.name}
            </span>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker(port.coords, { icon: portIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family:sans-serif; min-width:140px;">
          <div style="font-weight:bold; color:#00E5FF; font-size:12px;">Port of ${port.name}</div>
          <div style="font-size:10px; color:#94A3B8; margin-top:2px;">Country: ${port.country}</div>
          <div style="font-size:10px; color:#CBD5E1; margin-top:4px;">
            <div><strong>Throughput:</strong> ${port.cargoVolume}</div>
            <div><strong>Active Vessels:</strong> ${port.activeVessels} in berth/roads</div>
          </div>
        </div>
      `);
    });

    // Active Vessels with Live Radar Pulse
    const liveVessels = [
      { name: 'MV Orion', coords: [21.8, 65.5] as [number, number], fuel: 'LNG', speed: '12.8 kn' },
      { name: 'MV Meridian', coords: [8.7, 92.5] as [number, number], fuel: 'Ammonia', speed: '15.1 kn' },
      { name: 'MV Polaris', coords: [16.5, 73.3] as [number, number], fuel: 'Methanol', speed: '11.5 kn' },
    ];

    liveVessels.forEach(v => {
      const vIcon = L.divIcon({
        className: 'custom-live-vessel',
        html: `
          <div style="position:relative; display:flex; align-items:center; justify-content:center; transform:translate(-50%, -50%);">
            <div style="position:absolute; height:18px; width:18px; border-radius:50%; border:1.5px solid #10B981; opacity:0.8; animation: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="height:9px; width:9px; border-radius:50%; background:#10B981; border:1.5px solid #06141D; box-shadow:0 0 8px #10B981;"></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const vm = L.marker(v.coords, { icon: vIcon }).addTo(map);
      vm.bindPopup(`
        <div style="font-family:sans-serif;">
          <div style="font-weight:bold; color:#10B981; font-size:11px;">${v.name} (Underway)</div>
          <div style="font-size:10px; color:#CBD5E1; margin-top:2px;">
            <div>Speed: ${v.speed}</div>
            <div>Fuel: ${v.fuel}</div>
          </div>
        </div>
      `);
    });

    // Fit bounds across all ports
    map.fitBounds([
      [27.0, 52.0],
      [0.0, 106.0]
    ], { padding: [20, 20] });

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
        [27.0, 52.0],
        [0.0, 106.0]
      ], { padding: [20, 20] });
    }
  };

  return (
    <div className="lg:col-span-2 bg-[#06141D] rounded-xl p-4 border border-slate-800 shadow-sm text-white flex flex-col justify-between relative overflow-hidden min-h-[340px]">
      {/* Header & Legend */}
      <div className="flex items-start justify-between z-10">
        <div>
          <div className="text-xs font-semibold text-white">Active Routes &amp; Fleet Position</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Live routes. Line thickness indicates cargo volume.
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-300 bg-[#0A1D2A] px-2.5 py-1 rounded-md border border-slate-700/60">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-400"></span> HFO
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400"></span> LNG
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-purple-400"></span> Methanol
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span> Ammonia
          </span>
        </div>
      </div>

      {/* Real Interactive Leaflet Marine Map */}
      <div className="relative w-full h-[270px] mt-2 rounded-lg overflow-hidden border border-slate-800/80 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Map Control Buttons: Reset & Toggle Satellite */}
        <div className="absolute bottom-2 left-2 z-[400] flex items-center gap-1.5">
          <button
            onClick={handleResetView}
            title="Reset Network View"
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

        {/* Live GIS Status Badge */}
        <div className="absolute top-2 left-2 z-[400] bg-[#06141D]/90 border border-slate-700/70 text-slate-300 rounded px-2 py-0.5 text-[9px] font-mono flex items-center gap-1.5 backdrop-blur-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Live Marine GIS: 9 Ports · 11 Corridors</span>
        </div>
      </div>
    </div>
  );
};
