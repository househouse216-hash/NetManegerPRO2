
import React, { useState } from 'react';
import { PortMapping } from '../types';
import { Cable, Plus, Edit, Trash2, X, Save, Layers, Hash } from 'lucide-react';

interface Props {
  mappings: PortMapping[];
  setMappings: React.Dispatch<React.SetStateAction<PortMapping[]>>;
  searchTerm: string;
}

const PortMappingTab: React.FC<Props> = ({ mappings, setMappings, searchTerm }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortMapping | null>(null);

  const filtered = mappings.filter(m => 
    m.patchPanelPort.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.endDevice.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.destinationSwitch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const itemData: PortMapping = {
      id: editingItem?.id || Math.random().toString(36).substr(2, 9),
      patchPanelPort: formData.get('patchPanelPort') as string,
      endDevice: formData.get('endDevice') as string,
      destinationSwitch: formData.get('destinationSwitch') as string,
      switchPort: formData.get('switchPort') as string,
      vlan: formData.get('vlan') as string,
      cableType: formData.get('cableType') as any,
    };

    if (editingItem) {
      setMappings(prev => prev.map(m => m.id === editingItem.id ? itemData : m));
    } else {
      setMappings(prev => [...prev, itemData]);
    }

    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja excluir este mapeamento de porta permanentemente?')) {
      setMappings(prev => prev.filter(m => m.id !== id));
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Mapeamento Físico & Patch Panel</h2>
          <p className="text-sm text-slate-500">Documentação da camada 1: Da tomada ao switch central</p>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
        >
          <Plus size={18} /> Novo Mapeamento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div key={item.id} className="group relative bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-500 hover:shadow-xl transition-all">
            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                className="p-2 bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors"
                title="Editar"
              >
                <Edit size={14} />
              </button>
              <button 
                onClick={() => handleDelete(item.id)}
                className="p-2 bg-slate-100 text-slate-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                title="Excluir"
              >
                <Trash2 size={14} />
              </button>
            </div>
            
            <div className="flex items-center gap-4 mb-5">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-xl border border-blue-100">
                <Cable size={24} />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Porta Patch Panel</div>
                <div className="text-xl font-black text-slate-800">{item.patchPanelPort}</div>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 flex items-center gap-1.5"><Hash size={14} /> Terminal:</span>
                <span className="font-bold text-slate-900">{item.endDevice}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 flex items-center gap-1.5"><Layers size={14} /> Switch:</span>
                <span className="font-medium text-slate-700">{item.destinationSwitch}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-bold uppercase">{item.cableType}</span>
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-sm">
                  PORTA {item.switchPort} | VLAN {item.vlan}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">
                {editingItem ? 'Editar Mapeamento' : 'Novo Mapeamento Físico'}
              </h3>
              <button onClick={() => { setIsModalOpen(false); setEditingItem(null); }} className="p-2 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-slate-600 shadow-sm">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Patch Panel Port</label>
                  <input required name="patchPanelPort" defaultValue={editingItem?.patchPanelPort} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" placeholder="Ex: B-22" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Terminal Final</label>
                  <input required name="endDevice" defaultValue={editingItem?.endDevice} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" placeholder="Ex: Recepção PC" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Switch de Conexão</label>
                <input required name="destinationSwitch" defaultValue={editingItem?.destinationSwitch} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" placeholder="Ex: UniFi Switch Core 48" />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Porta do Switch</label>
                  <input required name="switchPort" defaultValue={editingItem?.switchPort} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" placeholder="Ex: 42" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">VLAN ID</label>
                  <input required name="vlan" defaultValue={editingItem?.vlan} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" placeholder="Ex: 1" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Tipo de Cabo</label>
                <select name="cableType" defaultValue={editingItem?.cableType || 'Cat6'} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="Cat5e">Cat5e (Fast Ethernet/Gigabit)</option>
                  <option value="Cat6">Cat6 (Gigabit/10Gbps)</option>
                  <option value="Fiber">Fibra Óptica (SFP/SFP+)</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-all">Cancelar</button>
                <button type="submit" className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                  <Save size={18} /> Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortMappingTab;
