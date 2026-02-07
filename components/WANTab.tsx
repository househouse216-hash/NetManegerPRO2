
import React from 'react';
import { WANProvider } from '../types';
import { Globe, Phone, FileText, Zap } from 'lucide-react';

interface Props {
  wan: WANProvider[];
  setWan: React.Dispatch<React.SetStateAction<WANProvider[]>>;
  searchTerm: string;
}

const WANTab: React.FC<Props> = ({ wan, searchTerm }) => {
  const filtered = wan.filter(w => 
    w.isp.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.publicIp.includes(searchTerm)
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-800">Provedores e Links de Internet</h2>
        <p className="text-sm text-slate-500">Gerenciamento de contratos WAN e IPs públicos</p>
      </div>

      <div className="space-y-6">
        {filtered.map((item) => (
          <div key={item.id} className="bg-white border-2 border-slate-100 rounded-2xl p-6 shadow-sm hover:border-blue-200 transition-all">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                  <Globe size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{item.isp}</h3>
                  <div className="flex items-center gap-2 text-slate-500 mt-1">
                    <Zap size={14} className="text-amber-500 fill-amber-500" />
                    <span className="text-sm font-medium">{item.connectionType} — {item.speed}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 text-white p-4 rounded-xl min-w-[200px]">
                <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">IP Público WAN</div>
                <div className="text-xl font-mono font-bold tracking-wider">{item.publicIp}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 pt-8 border-t border-slate-100">
              <div className="flex gap-3">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Phone size={20} /></div>
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">Suporte / Contato</div>
                  <div className="text-sm font-semibold text-slate-700">{item.contact}</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><FileText size={20} /></div>
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">Nº Contrato</div>
                  <div className="text-sm font-semibold text-slate-700">{item.contractNumber}</div>
                </div>
              </div>
              <div className="flex items-center justify-end">
                 <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2 rounded-xl text-sm font-bold transition-colors">
                    Ver Contrato Completo
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WANTab;
