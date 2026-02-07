
import React, { useState, useEffect } from 'react';
import { 
  Network, 
  HardDrive, 
  MapPin, 
  Globe, 
  Layout, 
  Plus, 
  Search,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Sparkles,
  Link2
} from 'lucide-react';
import { 
  TabType, 
  Equipment, 
  IPAMEntry, 
  PortMapping, 
  WANProvider 
} from './types';
import { 
  INITIAL_EQUIPMENT, 
  INITIAL_IPAM, 
  INITIAL_MAPPINGS, 
  INITIAL_WAN 
} from './constants';
import InventoryTab from './components/InventoryTab';
import IPAMTab from './components/IPAMTab';
import PortMappingTab from './components/PortMappingTab';
import WANTab from './components/WANTab';
import DiagramTab from './components/DiagramTab';
import GeminiOptimizer from './components/GeminiOptimizer';
import IntegrationsTab from './components/IntegrationsTab';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('inventory');
  const [equipment, setEquipment] = useState<Equipment[]>(INITIAL_EQUIPMENT);
  const [ipam, setIpam] = useState<IPAMEntry[]>(INITIAL_IPAM);
  const [mappings, setMappings] = useState<PortMapping[]>(INITIAL_MAPPINGS);
  const [wan, setWan] = useState<WANProvider[]>(INITIAL_WAN);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const savedData = localStorage.getItem('netmanager_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setEquipment(parsed.equipment || INITIAL_EQUIPMENT);
        setIpam(parsed.ipam || INITIAL_IPAM);
        setMappings(parsed.mappings || INITIAL_MAPPINGS);
        setWan(parsed.wan || INITIAL_WAN);
      } catch (e) {
        console.error("Failed to load data", e);
      }
    }
  }, []);

  const saveData = () => {
    localStorage.setItem('netmanager_data', JSON.stringify({ equipment, ipam, mappings, wan }));
    alert('Dados salvos com sucesso!');
  };

  const navItems = [
    { id: 'inventory', label: 'Inventário', icon: <HardDrive size={18} /> },
    { id: 'ipam', label: 'Gerenciamento IP', icon: <Network size={18} /> },
    { id: 'mapping', label: 'Portas/Patch', icon: <MapPin size={18} /> },
    { id: 'wan', label: 'Provedores/WAN', icon: <Globe size={18} /> },
    { id: 'diagram', label: 'Diagrama', icon: <Layout size={18} /> },
    { id: 'ai', label: 'Otimizador IA', icon: <Sparkles size={18} /> },
    { id: 'integrations', label: 'API Integrations', icon: <Link2 size={18} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-slate-900 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">NetManager <span className="text-blue-400">Pro</span></h1>
              <p className="text-xs text-slate-400">Documentação Profissional de Redes</p>
            </div>
          </div>

          <div className="flex flex-1 max-w-xl mx-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar em IP, MAC, Modelo ou Observações..." 
              className="w-full bg-slate-800 border border-slate-700 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={saveData}
              className="bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition-colors border border-slate-700" 
              title="Salvar Localmente"
            >
              <RefreshCw size={20} />
            </button>
            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center border-2 border-slate-600 overflow-hidden">
               <img src="https://picsum.photos/seed/it-admin/100/100" alt="Admin" />
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-slate-200 sticky top-[72px] md:top-[72px] z-40">
        <div className="container mx-auto px-4 overflow-x-auto">
          <ul className="flex items-center">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id as TabType)}
                  className={`flex items-center gap-2 py-4 px-6 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
                    activeTab === item.id 
                      ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <main className="flex-1 container mx-auto p-4 md:p-6 pb-20">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px]">
          {activeTab === 'inventory' && (
            <InventoryTab equipment={equipment} setEquipment={setEquipment} searchTerm={searchTerm} />
          )}
          {activeTab === 'ipam' && (
            <IPAMTab entries={ipam} setEntries={setIpam} searchTerm={searchTerm} />
          )}
          {activeTab === 'mapping' && (
            <PortMappingTab mappings={mappings} setMappings={setMappings} searchTerm={searchTerm} />
          )}
          {activeTab === 'wan' && (
            <WANTab wan={wan} setWan={setWan} searchTerm={searchTerm} />
          )}
          {activeTab === 'diagram' && (
            <DiagramTab equipment={equipment} mappings={mappings} />
          )}
          {activeTab === 'ai' && (
            <GeminiOptimizer data={{ equipment, ipam, mappings, wan }} />
          )}
          {activeTab === 'integrations' && (
            <IntegrationsTab setEquipment={setEquipment} setIpam={setIpam} />
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 p-4 mt-auto">
        <div className="container mx-auto flex justify-between items-center text-slate-500 text-xs">
          <p>&copy; 2024 NetManager Pro - Documentação Unificada (UniFi & MikroTik Ready)</p>
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><Cpu size={12} /> v2.5.0-Enterprise</span>
            <span className="flex items-center gap-1 text-green-600"><ShieldCheck size={12} /> Sincronizado</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
