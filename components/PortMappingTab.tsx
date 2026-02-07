
import React from 'react';
import { PortMapping } from '../types';
import { Cable, MoreHorizontal } from 'lucide-react';

interface Props {
  mappings: PortMapping[];
  setMappings: React.Dispatch<React.SetStateAction<PortMapping[]>>;
  searchTerm: string;
}

const PortMappingTab: React.FC<Props> = ({ mappings, searchTerm }) => {
  const filtered = mappings.filter(m => 
    m.patchPanelPort.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.endDevice.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.destinationSwitch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Mapeamento de Portas & Cabeamento</h2>
        <p className="text-sm text-slate-500">Documentação física do Patch Panel ao Switch</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div key={item.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-white hover:shadow-md transition-all group relative">
            <button className="absolute top-4 right-4 text-slate-300 hover:text-slate-600">
               <MoreHorizontal size={18} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white border border-slate-200 p-2 rounded-lg text-blue-600 shadow-sm">
                <Cable size={20} />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Patch Panel</div>
                <div className="text-lg font-bold text-slate-800 leading-none">{item.patchPanelPort}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Dispositivo Final:</span>
                <span className="font-semibold text-slate-700">{item.endDevice}</span>
              </div>
              <div className="h-px bg-slate-200 w-full"></div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Switch:</span>
                <span className="font-medium text-slate-800">{item.destinationSwitch}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Porta:</span>
                <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[11px] font-bold">{item.switchPort}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Cabo / VLAN:</span>
                <span className="text-xs text-slate-600">{item.cableType} | <span className="font-bold">VLAN {item.vlan}</span></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortMappingTab;
