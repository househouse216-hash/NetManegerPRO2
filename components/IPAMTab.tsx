
import React, { useState } from 'react';
import { IPAMEntry } from '../types';
import { Edit3, Hash, Info, Trash2, Plus, X, Save, AlertCircle, Database, Network, User } from 'lucide-react';
import { isValidIP, isValidMask } from '../utils/validation';

interface Props {
  entries: IPAMEntry[];
  setEntries: React.Dispatch<React.SetStateAction<IPAMEntry[]>>;
  searchTerm: string;
}

const IPAMTab: React.FC<Props> = ({ entries, setEntries, searchTerm }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IPAMEntry | null>(null);
  const [sourceFilter, setSourceFilter] = useState<'All' | 'Manual' | 'UniFi' | 'MikroTik'>('All');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = entries.filter(e => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = 
      e.deviceName.toLowerCase().includes(s) ||
      e.ip.includes(s) ||
      e.vlanId.includes(s) ||
      e.notes.toLowerCase().includes(s);
    
    const matchesSource = sourceFilter === 'All' || (e.source || 'Manual') === sourceFilter;
    
    return matchesSearch && matchesSource;
  });

  const getSourceIcon = (source?: string) => {
    switch (source) {
      case 'UniFi': return <Network size={12} className="text-blue-500" />;
      case 'MikroTik': return <Database size={12} className="text-indigo-500" />;
      default: return <User size={12} className="text-slate-400" />;
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newErrors: Record<string, string> = {};

    const ip = formData.get('ip') as string;
    const mask = formData.get('mask') as string;
    const gateway = formData.get('gateway') as string;

    if (!isValidIP(ip)) newErrors.ip = 'Endereço IP inválido';
    if (!isValidMask(mask)) newErrors.mask = 'Máscara de sub-rede inválida';
    if (gateway !== '---' && gateway !== '' && !isValidIP(gateway)) newErrors.gateway = 'Gateway inválido';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const itemData: IPAMEntry = {
      id: editingItem?.id || Math.random().toString(36).substr(2, 9),
      deviceName: formData.get('deviceName') as string,
      ip,
      mask,
      gateway: gateway || '---',
      vlanId: formData.get('vlanId') as string,
      type: formData.get('type') as any,
      notes: formData.get('notes') as string,
      source: editingItem?.source || 'Manual'
    };

    if (editingItem) {
      setEntries(prev => prev.map(e => e.id === editingItem.id ? itemData : e));
    } else {
      setEntries(prev => [...prev, itemData]);
    }

    setIsModalOpen(false);
    setEditingItem(null);
    setErrors({});
  };

  const deleteItem = (id: string) => {
    if (confirm('Deseja excluir este registro IPAM?')) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">IPAM - Gerenciamento de IP</h2>
          <p className="text-sm text-slate-500">Mapeamento de subnets, VLANs e gateways</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Source Filter */}
          <div className="hidden lg:flex gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 mr-2">
            {['All', 'Manual', 'UniFi', 'MikroTik'].map((s) => (
              <button
                key={s}
                onClick={() => setSourceFilter(s as any)}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all uppercase ${
                  sourceFilter === s 
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {s === 'All' ? 'FONTES' : s}
              </button>
            ))}
          </div>

          <div className="hidden md:flex gap-2 mr-2">
            <div className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded uppercase flex items-center gap-1 border border-blue-100">
              <Hash size={12} /> Estáticos: {entries.filter(e => e.type === 'Estático').length}
            </div>
          </div>
          <button 
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus size={18} /> Novo IP
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-100 rounded-xl shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50">
            <tr className="text-slate-500 text-[11px] uppercase tracking-wider">
              <th className="px-4 py-4 border-b">Endereço IP</th>
              <th className="px-4 py-4 border-b">Dispositivo / Fonte</th>
              <th className="px-4 py-4 border-b text-center">VLAN</th>
              <th className="px-4 py-4 border-b">Máscara / Gateway</th>
              <th className="px-4 py-4 border-b">Tipo</th>
              <th className="px-4 py-4 border-b text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-4 py-4 text-sm font-mono text-blue-700 font-bold">{item.ip}</td>
                <td className="px-4 py-4">
                   <div className="flex items-center gap-2">
                      {getSourceIcon(item.source)}
                      <div>
                        <div className="text-sm text-slate-700 font-medium">{item.deviceName}</div>
                        <div className="text-[10px] text-slate-400 italic">{item.notes}</div>
                      </div>
                   </div>
                </td>
                <td className="px-4 py-4 text-sm text-center">
                   <span className="bg-slate-800 text-white px-2 py-0.5 rounded text-[10px] font-mono">ID {item.vlanId}</span>
                </td>
                <td className="px-4 py-4">
                   <div className="text-[10px] text-slate-400 font-mono tracking-tighter">{item.mask}</div>
                   <div className="text-xs text-slate-600 font-mono">{item.gateway}</div>
                </td>
                <td className="px-4 py-4">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${
                    item.type === 'Estático' 
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-100' 
                      : 'bg-green-50 text-green-700 border-green-100'
                  }`}>
                    {item.type}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                   <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => deleteItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {editingItem ? 'Editar Registro IP' : 'Novo Registro IP'}
                </h3>
                <p className="text-[10px] text-slate-400 uppercase">Fonte: {editingItem?.source || 'Manual'}</p>
              </div>
              <button onClick={() => { setIsModalOpen(false); setErrors({}); }} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Nome / Dispositivo</label>
                <input required name="deviceName" defaultValue={editingItem?.deviceName} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Impressora RH" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Endereço IP</label>
                  <input required name="ip" defaultValue={editingItem?.ip} className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${errors.ip ? 'border-red-500' : 'border-slate-200'}`} placeholder="192.168.x.x" />
                  {errors.ip && <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1"><AlertCircle size={10} /> {errors.ip}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">VLAN ID</label>
                  <input required name="vlanId" defaultValue={editingItem?.vlanId} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="10" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Máscara Sub-rede</label>
                  <input required name="mask" defaultValue={editingItem?.mask || '255.255.255.0'} className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${errors.mask ? 'border-red-500' : 'border-slate-200'}`} placeholder="255.255.255.0" />
                  {errors.mask && <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1"><AlertCircle size={10} /> {errors.mask}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Gateway</label>
                  <input name="gateway" defaultValue={editingItem?.gateway} className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${errors.gateway ? 'border-red-500' : 'border-slate-200'}`} placeholder="192.168.x.1" />
                  {errors.gateway && <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1"><AlertCircle size={10} /> {errors.gateway}</p>}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Tipo de IP</label>
                <select name="type" defaultValue={editingItem?.type || 'Estático'} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="Estático">Estático</option>
                  <option value="DHCP">DHCP</option>
                  <option value="Reservado">Reservado</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Observações</label>
                <textarea name="notes" defaultValue={editingItem?.notes} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 h-20" placeholder="Informações adicionais..." />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setIsModalOpen(false); setErrors({}); }} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-2 shadow-lg transition-all">
                  <Save size={18} /> Salvar IP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IPAMTab;
