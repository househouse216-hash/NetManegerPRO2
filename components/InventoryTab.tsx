
import React, { useState } from 'react';
import { Equipment, DeviceStatus, DeviceType } from '../types';
import { Trash2, Edit, ExternalLink, Shield, X, Save, AlertCircle, Filter, Plus, Database, Network, User } from 'lucide-react';
import { isValidIP, isValidMAC } from '../utils/validation';

interface Props {
  equipment: Equipment[];
  setEquipment: React.Dispatch<React.SetStateAction<Equipment[]>>;
  searchTerm: string;
}

const InventoryTab: React.FC<Props> = ({ equipment, setEquipment, searchTerm }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [statusFilter, setStatusFilter] = useState<DeviceStatus | 'All'>('All');
  const [sourceFilter, setSourceFilter] = useState<'All' | 'Manual' | 'UniFi' | 'MikroTik'>('All');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = equipment.filter(e => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = 
      e.name.toLowerCase().includes(s) ||
      e.model.toLowerCase().includes(s) ||
      e.ip.includes(s) ||
      e.mac.toLowerCase().includes(s) ||
      (e.observations?.toLowerCase() || '').includes(s) ||
      e.location.toLowerCase().includes(s);
    
    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
    const matchesSource = sourceFilter === 'All' || (e.source || 'Manual') === sourceFilter;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  const getStatusColor = (status: DeviceStatus) => {
    switch (status) {
      case DeviceStatus.Ativo: return 'bg-green-100 text-green-700 border-green-200';
      case DeviceStatus.Manutencao: return 'bg-amber-100 text-amber-700 border-amber-200';
      case DeviceStatus.Estoque: return 'bg-slate-100 text-slate-700 border-slate-200';
      case DeviceStatus.Offline: return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

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
    const mac = formData.get('mac') as string;

    if (!isValidIP(ip)) newErrors.ip = 'Endereço IP inválido';
    if (!isValidMAC(mac)) newErrors.mac = 'MAC Address inválido (Ex: AA:BB:CC:11:22:33)';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const itemData: Equipment = {
      id: editingItem?.id || Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      type: formData.get('type') as DeviceType,
      model: formData.get('model') as string,
      location: formData.get('location') as string,
      ip,
      mac,
      firmware: formData.get('firmware') as string,
      status: formData.get('status') as DeviceStatus,
      observations: formData.get('observations') as string,
      source: editingItem?.source || 'Manual'
    };

    if (editingItem) {
      setEquipment(prev => prev.map(e => e.id === editingItem.id ? itemData : e));
    } else {
      setEquipment(prev => [...prev, itemData]);
    }

    setIsModalOpen(false);
    setEditingItem(null);
    setErrors({});
  };

  return (
    <div className="p-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Inventário de Equipamentos</h2>
          <p className="text-sm text-slate-500">Documentação física e lógica de ativos</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Quick Source Selection */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            {['All', 'Manual', 'UniFi', 'MikroTik'].map((s) => (
              <button
                key={s}
                onClick={() => setSourceFilter(s as any)}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all uppercase ${
                  sourceFilter === s 
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {s === 'All' ? 'TODAS FONTES' : s}
              </button>
            ))}
          </div>

          {/* Quick Status Selection */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            {['All', ...Object.values(DeviceStatus)].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s as any)}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all uppercase ${
                  statusFilter === s 
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {s === 'All' ? 'STATUS' : s}
              </button>
            ))}
          </div>

          <button 
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm whitespace-nowrap ml-auto"
          >
            <Plus size={18} /> Novo Item
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase tracking-wider bg-slate-50/50">
              <th className="px-4 py-3 font-semibold">Ativo / Fonte</th>
              <th className="px-4 py-3 font-semibold">Modelo & Local</th>
              <th className="px-4 py-3 font-semibold">Endereço IP</th>
              <th className="px-4 py-3 font-semibold">MAC Address</th>
              <th className="px-4 py-3 font-semibold text-center">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length > 0 ? filtered.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 relative">
                      <Shield size={18} />
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-slate-100">
                        {getSourceIcon(item.source)}
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-800">{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                        {item.type} 
                        {item.source && item.source !== 'Manual' && (
                          <span className="text-blue-500 lowercase font-normal italic">via {item.source}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-slate-600 font-medium">{item.model}</div>
                  <div className="text-[10px] text-slate-400 italic">{item.location}</div>
                </td>
                <td className="px-4 py-4 text-sm font-mono text-blue-600 font-medium">
                  <a href={`http://${item.ip}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                    {item.ip} <ExternalLink size={12} />
                  </a>
                </td>
                <td className="px-4 py-4 text-xs font-mono text-slate-500">{item.mac}</td>
                <td className="px-4 py-4 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(item.status)}`}>
                    {item.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => { if(confirm('Excluir?')) setEquipment(p => p.filter(x => x.id !== item.id)) }}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-4 py-20 text-center text-slate-300 italic">
                  Nenhum equipamento encontrado com estes critérios.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {editingItem ? 'Editar Ativo de Rede' : 'Novo Registro de Ativo'}
                </h3>
                <p className="text-xs text-slate-400">Origem: {editingItem?.source || 'Manual'}</p>
              </div>
              <button onClick={() => { setIsModalOpen(false); setErrors({}); }} className="p-2 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-slate-600 shadow-sm">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">Nome do Dispositivo*</label>
                  <input required name="name" defaultValue={editingItem?.name} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none" placeholder="Ex: Core Router" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Tipo de Ativo</label>
                  <select name="type" defaultValue={editingItem?.type || DeviceType.Router} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none">
                    {Object.values(DeviceType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Fabricante / Modelo*</label>
                  <input required name="model" defaultValue={editingItem?.model} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none" placeholder="Ex: MikroTik CCR2004" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Endereço IP*</label>
                  <input required name="ip" defaultValue={editingItem?.ip} className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none ${errors.ip ? 'border-red-500 ring-1 ring-red-200' : 'border-slate-200'}`} placeholder="192.168.1.1" />
                  {errors.ip && <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1"><AlertCircle size={12} /> {errors.ip}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">MAC Address*</label>
                  <input required name="mac" defaultValue={editingItem?.mac} className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none ${errors.mac ? 'border-red-500 ring-1 ring-red-200' : 'border-slate-200'}`} placeholder="FF:FF:FF:00:00:00" />
                  {errors.mac && <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1"><AlertCircle size={12} /> {errors.mac}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                  <select name="status" defaultValue={editingItem?.status || DeviceStatus.Ativo} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none">
                    {Object.values(DeviceStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Observações Internas</label>
                <textarea name="observations" defaultValue={editingItem?.observations} rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none resize-none" placeholder="Ex: Conectado via link redundante, backup mensal agendado..." />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => { setIsModalOpen(false); setErrors({}); }} className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-all">Cancelar</button>
                <button type="submit" className="px-10 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                  <Save size={18} /> Salvar Ativo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryTab;
