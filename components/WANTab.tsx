
import React, { useState } from 'react';
import { WANProvider } from '../types';
import { Globe, Phone, FileText, Zap, Plus, Edit, Trash2, X, Save, ShieldCheck } from 'lucide-react';

interface Props {
  wan: WANProvider[];
  setWan: React.Dispatch<React.SetStateAction<WANProvider[]>>;
  searchTerm: string;
}

const WANTab: React.FC<Props> = ({ wan, setWan, searchTerm }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WANProvider | null>(null);

  const filtered = wan.filter(w => 
    w.isp.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.publicIp.includes(searchTerm) ||
    w.contractNumber.includes(searchTerm)
  );

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const itemData: WANProvider = {
      id: editingItem?.id || Math.random().toString(36).substr(2, 9),
      isp: formData.get('isp') as string,
      connectionType: formData.get('connectionType') as string,
      speed: formData.get('speed') as string,
      publicIp: formData.get('publicIp') as string,
      contact: formData.get('contact') as string,
      contractNumber: formData.get('contractNumber') as string,
    };

    if (editingItem) {
      setWan(prev => prev.map(w => w.id === editingItem.id ? itemData : w));
    } else {
      setWan(prev => [...prev, itemData]);
    }

    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Atenção: A exclusão do provedor WAN removerá os registros de IP público. Continuar?')) {
      setWan(prev => prev.filter(w => w.id !== id));
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Backbone WAN & Links de Internet</h2>
          <p className="text-sm text-slate-500">Gestão de conectividade externa, contratos de ISP e IPs públicos</p>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-slate-900/20 transition-all active:scale-95"
        >
          <Plus size={18} /> Adicionar Link
        </button>
      </div>

      <div className="space-y-8">
        {filtered.map((item) => (
          <div key={item.id} className="group bg-white border-2 border-slate-100 rounded-3xl p-8 shadow-sm hover:border-blue-500 hover:shadow-2xl transition-all relative">
            <div className="absolute top-8 right-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                className="p-3 bg-slate-50 text-slate-500 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"
              >
                <Edit size={18} />
              </button>
              <button 
                onClick={() => handleDelete(item.id)}
                className="p-3 bg-slate-50 text-slate-500 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="flex flex-col xl:flex-row justify-between items-start gap-10">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Globe size={40} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">{item.isp}</h3>
                  <div className="flex items-center gap-3 text-slate-500 mt-2">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-100">
                      <Zap size={14} className="fill-amber-700" /> {item.speed}
                    </div>
                    <span className="text-sm font-semibold">{item.connectionType}</span>
                  </div>
                </div>
              </div>

              <div className="w-full xl:w-auto flex flex-col gap-2">
                <div className="bg-slate-900 text-white p-6 rounded-2xl min-w-[300px] border border-slate-800 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Globe size={80} />
                   </div>
                   <div className="relative z-10">
                      <div className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                        <ShieldCheck size={12} /> IP Público / Gateway WAN
                      </div>
                      <div className="text-3xl font-mono font-bold tracking-tighter">{item.publicIp}</div>
                   </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-10 pt-10 border-t border-slate-100">
              <div className="flex gap-4">
                <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 border border-slate-100"><Phone size={24} /></div>
                <div>
                  <div className="text-[10px] text-slate-400 font-black uppercase mb-1">Central de Suporte</div>
                  <div className="text-base font-bold text-slate-800">{item.contact}</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 border border-slate-100"><FileText size={24} /></div>
                <div>
                  <div className="text-[10px] text-slate-400 font-black uppercase mb-1">Nº do Contrato</div>
                  <div className="text-base font-bold text-slate-800">{item.contractNumber}</div>
                </div>
              </div>
              <div className="lg:col-span-2 flex items-center justify-end">
                 <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-8 py-3 rounded-2xl font-bold transition-all text-sm border border-slate-200 active:scale-95">
                    Detalhes do SLA & Contrato
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-800">
                {editingItem ? 'Configurar Link WAN' : 'Novo Provedor de Internet'}
              </h3>
              <button onClick={() => { setIsModalOpen(false); setEditingItem(null); }} className="p-2 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-slate-600 shadow-sm">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase">Nome do Provedor (ISP)</label>
                <input required name="isp" defaultValue={editingItem?.isp} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Ex: Vivo Empresas, Claro Fibra..." />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Tecnologia</label>
                  <input required name="connectionType" defaultValue={editingItem?.connectionType} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" placeholder="Ex: Fibra GPON" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Velocidade Contratada</label>
                  <input required name="speed" defaultValue={editingItem?.speed} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" placeholder="Ex: 1 Gbps" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase">IP Público Estático / DHCP</label>
                <input required name="publicIp" defaultValue={editingItem?.publicIp} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-mono" placeholder="Ex: 201.x.x.x" />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Contato Suporte</label>
                  <input required name="contact" defaultValue={editingItem?.contact} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" placeholder="Ex: 103 15" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Account / ID Contrato</label>
                  <input required name="contractNumber" defaultValue={editingItem?.contractNumber} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" placeholder="Ex: 9918237" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-600 font-bold">Descartar</button>
                <button type="submit" className="px-10 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold shadow-xl active:scale-95 transition-all flex items-center gap-2">
                  <Save size={18} /> Salvar Link WAN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WANTab;
