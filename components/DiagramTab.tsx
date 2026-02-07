
import React, { useMemo, useState } from 'react';
import { Equipment, DeviceType, DeviceStatus } from '../types';
// Added RefreshCw to fix "Cannot find name 'RefreshCw'" error on line 199. Removed unused imports.
import { Server, Monitor, Wifi, Shield, Box, Globe, RefreshCw } from 'lucide-react';

interface Props {
  equipment: Equipment[];
  mappings: any[];
}

const getIcon = (type: DeviceType) => {
  switch (type) {
    case DeviceType.Router:
    case DeviceType.Firewall: return <Shield size={20} />;
    case DeviceType.Switch: return <Box size={20} />;
    case DeviceType.AP: return <Wifi size={20} />;
    case DeviceType.Server: return <Server size={20} />;
    case DeviceType.Modem: return <Globe size={20} />;
    default: return <Monitor size={20} />;
  }
};

const Node: React.FC<{ 
  device: Equipment; 
  isActive: boolean; 
  onSelect: (id: string) => void 
}> = ({ device, isActive, onSelect }) => {
  const isDead = device.status === DeviceStatus.Offline;

  return (
    <div 
      onClick={(e) => { e.stopPropagation(); onSelect(device.id); }}
      className={`group relative flex flex-col items-center transition-all duration-300 ${isActive ? 'scale-110 z-20' : 'z-10 hover:scale-105'}`}
    >
      <div className={`p-4 rounded-2xl border-2 cursor-pointer shadow-sm hover:shadow-xl flex flex-col items-center gap-2 min-w-[150px] transition-all ${
        isActive ? 'ring-4 ring-blue-500/20' : ''
      } ${
        device.type === DeviceType.Switch ? 'bg-blue-600 border-blue-700 text-white' : 
        (device.type === DeviceType.Router || device.type === DeviceType.Firewall) ? 'bg-slate-900 border-slate-950 text-white' :
        'bg-white border-slate-200 text-slate-800'
      } ${isDead ? 'grayscale opacity-60' : ''}`}>
        
        <div className="flex items-center justify-between w-full mb-1">
          <div className={device.type === DeviceType.Switch || device.type === DeviceType.Router ? 'text-white/80' : 'text-blue-600'}>
            {getIcon(device.type)}
          </div>
          <div className={`w-2.5 h-2.5 rounded-full border-2 border-white/20 ${isDead ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]'}`}></div>
        </div>

        <div className="text-center w-full">
          <div className="text-[10px] font-bold uppercase opacity-60 truncate">{device.name}</div>
          <div className="text-xs font-mono font-bold truncate tracking-tight">{device.ip}</div>
        </div>
      </div>

      {/* Connection Indicator for synced sources */}
      {device.source && device.source !== 'Manual' && (
        <div className="absolute -top-2 right-0 bg-white shadow-sm border border-slate-100 rounded-lg px-1.5 py-0.5 flex items-center gap-1">
           <span className="text-[7px] font-black text-slate-400 uppercase">{device.source}</span>
        </div>
      )}

      {/* Tooltip detail card */}
      <div className={`absolute top-full mt-3 w-64 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl z-50 transition-all pointer-events-none border border-slate-700 ${
        isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-black uppercase text-blue-400">{device.type}</span>
          <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${isDead ? 'bg-red-500' : 'bg-green-500'}`}>{device.status}</span>
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-bold border-b border-slate-800 pb-1 mb-1">{device.model}</p>
          <div className="flex justify-between text-[10px]">
            <span className="text-slate-400 uppercase">MAC:</span>
            <span className="font-mono">{device.mac}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-slate-400 uppercase">Location:</span>
            <span className="">{device.location}</span>
          </div>
          {device.lastSeen && (
            <div className="flex justify-between text-[8px] text-slate-500">
               <span>Última Sinc:</span>
               <span>{device.lastSeen}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DiagramTab: React.FC<Props> = ({ equipment }) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const grouped = useMemo(() => {
    return {
      gateways: equipment.filter(e => e.type === DeviceType.Router || e.type === DeviceType.Firewall || e.type === DeviceType.Modem),
      switches: equipment.filter(e => e.type === DeviceType.Switch),
      endpoints: equipment.filter(e => e.type === DeviceType.AP || e.type === DeviceType.Server),
    };
  }, [equipment]);

  return (
    <div className="p-6 bg-slate-50 min-h-[700px] flex flex-col items-center overflow-auto relative" onClick={() => setSelectedNode(null)}>
      
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden">
        <div className="h-full w-full" style={{ backgroundImage: 'radial-gradient(#334155 1.5px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      </div>

      <div className="text-center mb-12 relative z-10">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Topologia Dinâmica de Ativos</h2>
        <p className="text-sm text-slate-500">Visualização lógica baseada em inventário sincronizado (UniFi/MikroTik)</p>
      </div>

      <div className="w-full max-w-5xl flex flex-col items-center py-6 relative z-10">
        
        {/* Layer 1: WAN Gateways */}
        <div className="flex flex-wrap justify-center gap-12 relative">
          {grouped.gateways.map(g => (
            <Node 
              key={g.id} 
              device={g} 
              isActive={selectedNode === g.id} 
              onSelect={(id) => setSelectedNode(id)} 
            />
          ))}
          {grouped.gateways.length === 0 && (
            <div className="p-6 bg-slate-200 border-2 border-dashed border-slate-300 rounded-3xl text-slate-400 text-xs font-bold w-56 text-center">
              Sem Gateways Definidos
            </div>
          )}
        </div>

        {grouped.gateways.length > 0 && grouped.switches.length > 0 && (
          <div className="flex flex-col items-center my-6">
            <div className="w-px h-14 bg-gradient-to-b from-slate-300 to-blue-400"></div>
          </div>
        )}

        {/* Layer 2: Core/Distribution Switching */}
        <div className="flex flex-wrap justify-center gap-14 relative">
          {grouped.switches.map(s => (
            <Node 
              key={s.id} 
              device={s} 
              isActive={selectedNode === s.id} 
              onSelect={(id) => setSelectedNode(id)} 
            />
          ))}
        </div>

        {(grouped.switches.length > 0 || grouped.gateways.length > 0) && grouped.endpoints.length > 0 && (
           <div className="flex flex-col items-center my-6">
              <div className="w-px h-14 bg-gradient-to-b from-blue-400 to-indigo-300"></div>
           </div>
        )}

        {/* Layer 3: Endpoints & Clients */}
        <div className="flex flex-wrap justify-center gap-10 relative">
          {grouped.endpoints.map(e => (
            <Node 
              key={e.id} 
              device={e} 
              isActive={selectedNode === e.id} 
              onSelect={(id) => setSelectedNode(id)} 
            />
          ))}
          {equipment.filter(e => ![DeviceType.Router, DeviceType.Firewall, DeviceType.Modem, DeviceType.Switch, DeviceType.AP, DeviceType.Server].includes(e.type)).map(e => (
            <Node 
              key={e.id} 
              device={e} 
              isActive={selectedNode === e.id} 
              onSelect={(id) => setSelectedNode(id)} 
            />
          ))}
        </div>

        {/* Legend */}
        <div className="mt-20 p-5 bg-white rounded-3xl border border-slate-200 shadow-xl flex flex-wrap gap-8 items-center text-[10px] font-black uppercase text-slate-500">
           <div className="flex items-center gap-2">
             <div className="w-5 h-5 bg-slate-900 rounded-lg flex items-center justify-center text-[8px] text-white shadow-sm"><Shield size={12}/></div> 
             Layer 3 / WAN
           </div>
           <div className="flex items-center gap-2">
             <div className="w-5 h-5 bg-blue-600 rounded-lg flex items-center justify-center text-[8px] text-white shadow-sm"><Box size={12}/></div> 
             Layer 2 / Switch
           </div>
           <div className="flex items-center gap-2">
             <div className="w-5 h-5 bg-white border border-slate-300 rounded-lg flex items-center justify-center text-[8px] text-blue-600 shadow-sm"><Monitor size={12}/></div> 
             Access / Endp.
           </div>
           <div className="h-5 w-px bg-slate-200"></div>
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-sm shadow-green-400/50"></div> 
             ONLINE
           </div>
           <div className="flex items-center gap-2 text-indigo-500">
             <RefreshCw size={12} className="animate-spin" />
             SYNC AUTO
           </div>
        </div>
      </div>
    </div>
  );
};

export default DiagramTab;
