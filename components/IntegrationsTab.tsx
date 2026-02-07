
import React, { useState, useEffect } from 'react';
import { RefreshCw, Network, Link2, Settings, ShieldCheck, Database, Loader2, Info, CheckCircle2, AlertCircle, Eye, EyeOff, Save, Timer, Play } from 'lucide-react';
import { Equipment, IPAMEntry, IntegrationSettings, SyncInterval } from '../types';
import { syncUniFiData, syncMikroTikData, testConnection } from '../utils/networkApi';

interface Props {
  setEquipment: React.Dispatch<React.SetStateAction<Equipment[]>>;
  setIpam: React.Dispatch<React.SetStateAction<IPAMEntry[]>>;
}

const IntegrationsTab: React.FC<Props> = ({ setEquipment, setIpam }) => {
  const [syncing, setSyncing] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, { success: boolean, message: string } | null>>({
    unifi: null,
    mikrotik: null
  });
  const [showPass, setShowPass] = useState<Record<string, boolean>>({});
  const [config, setConfig] = useState<IntegrationSettings>({
    unifi: { url: '', user: '', pass: '', site: 'default', enabled: false, syncInterval: 'manual' },
    mikrotik: { host: '', user: '', pass: '', port: '8728', enabled: false, syncInterval: 'manual' }
  });

  useEffect(() => {
    const saved = localStorage.getItem('netmanager_integrations');
    if (saved) setConfig(JSON.parse(saved));
  }, []);

  const saveConfig = () => {
    localStorage.setItem('netmanager_integrations', JSON.stringify(config));
    alert('Configurações de integração salvas!');
  };

  const handleTest = async (provider: 'unifi' | 'mikrotik') => {
    setTesting(provider);
    setTestResult(prev => ({ ...prev, [provider]: null }));
    
    try {
      const result = await testConnection(provider, config[provider]);
      setTestResult(prev => ({ ...prev, [provider]: result }));
    } catch (e: any) {
      setTestResult(prev => ({ ...prev, [provider]: { success: false, message: e.message || 'Erro desconhecido' } }));
    } finally {
      setTesting(null);
    }
  };

  const handleSync = async (provider: 'unifi' | 'mikrotik') => {
    const providerConfig = config[provider];
    
    if (!providerConfig.user || !providerConfig.pass || (provider === 'unifi' ? !providerConfig.url : !providerConfig.host)) {
      alert(`Por favor, preencha as credenciais do ${provider === 'unifi' ? 'UniFi' : 'MikroTik'} antes de sincronizar.`);
      return;
    }

    setSyncing(provider);
    try {
      const data = provider === 'unifi' 
        ? await syncUniFiData(providerConfig)
        : await syncMikroTikData(providerConfig);

      setEquipment(prev => {
        const manual = prev.filter(e => e.source !== (provider === 'unifi' ? 'UniFi' : 'MikroTik'));
        return [...manual, ...data.equipment];
      });

      setIpam(prev => {
        const manual = prev.filter(e => e.source !== (provider === 'unifi' ? 'UniFi' : 'MikroTik'));
        return [...manual, ...data.ipam];
      });

      setTestResult(prev => ({ ...prev, [provider]: { success: true, message: 'Dados sincronizados!' } }));
    } catch (error: any) {
      setTestResult(prev => ({ ...prev, [provider]: { success: false, message: error.message } }));
    } finally {
      setSyncing(null);
    }
  };

  const togglePass = (id: string) => setShowPass(p => ({ ...p, [id]: !p[id] }));

  const updateConfig = (provider: 'unifi' | 'mikrotik', field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [provider]: { ...prev[provider], [field]: value }
    }));
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Link2 className="text-blue-600" size={32} />
            Network API Integrations
          </h2>
          <p className="text-slate-500 mt-2">Sincronize inventário e IPAM automaticamente via Controladores e Roteadores.</p>
        </div>
        <button onClick={saveConfig} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all">
          <Save size={18} /> Salvar Preferências
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* UniFi Section */}
        <div className="bg-white border-2 border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:border-blue-200 transition-all flex flex-col">
          <div className="p-8 border-b border-slate-50 bg-slate-50/50">
            <div className="flex justify-between items-center mb-4">
              <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center">
                <Network size={28} />
              </div>
              <div className="flex items-center gap-3">
                 <div className="flex flex-col items-end">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Auto Sync</label>
                    <select 
                      value={config.unifi.syncInterval}
                      onChange={(e) => updateConfig('unifi', 'syncInterval', e.target.value)}
                      className="text-xs bg-transparent border-none font-bold text-slate-700 focus:ring-0 cursor-pointer"
                    >
                      <option value="manual">Manual</option>
                      <option value="hourly">A cada hora</option>
                      <option value="daily">Diariamente</option>
                    </select>
                 </div>
                 <div 
                    onClick={() => updateConfig('unifi', 'enabled', !config.unifi.enabled)}
                    className={`w-10 h-5 rounded-full relative cursor-pointer transition-all ${config.unifi.enabled ? 'bg-green-500' : 'bg-slate-300'}`}
                 >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config.unifi.enabled ? 'left-6' : 'left-1'}`}></div>
                 </div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900">UniFi Controller API</h3>
            <p className="text-sm text-slate-500 mt-1">Sincroniza UAPs, Switches e USGs em tempo real.</p>
          </div>
          
          <div className="p-8 space-y-4 flex-1">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Controller URL</label>
              <input 
                type="text" 
                value={config.unifi.url}
                onChange={(e) => updateConfig('unifi', 'url', e.target.value)}
                placeholder="https://192.168.1.5:8443" 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Usuário</label>
                <input 
                  type="text" 
                  value={config.unifi.user}
                  onChange={(e) => updateConfig('unifi', 'user', e.target.value)}
                  placeholder="admin" 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Senha</label>
                <div className="relative">
                  <input 
                    type={showPass.unifi ? "text" : "password"} 
                    value={config.unifi.pass}
                    onChange={(e) => updateConfig('unifi', 'pass', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                  />
                  <button onClick={() => togglePass('unifi')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPass.unifi ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Site Name (Slug)</label>
              <input 
                type="text" 
                value={config.unifi.site}
                onChange={(e) => updateConfig('unifi', 'site', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
              />
            </div>

            {testResult.unifi && (
              <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-medium ${testResult.unifi.success ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                {testResult.unifi.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {testResult.unifi.message}
              </div>
            )}
          </div>

          <div className="p-8 pt-0 mt-auto flex gap-3">
            <button 
              disabled={!!testing || !!syncing}
              onClick={() => handleTest('unifi')}
              className="flex-1 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {testing === 'unifi' ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
              Testar Conexão
            </button>
            <button 
              disabled={!!syncing || !!testing}
              onClick={() => handleSync('unifi')}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {syncing === 'unifi' ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
              Sincronizar
            </button>
          </div>
        </div>

        {/* MikroTik Section */}
        <div className="bg-white border-2 border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:border-indigo-200 transition-all flex flex-col">
          <div className="p-8 border-b border-slate-50 bg-slate-50/50">
            <div className="flex justify-between items-center mb-4">
              <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center">
                <Settings size={28} />
              </div>
              <div className="flex items-center gap-3">
                 <div className="flex flex-col items-end">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Auto Sync</label>
                    <select 
                      value={config.mikrotik.syncInterval}
                      onChange={(e) => updateConfig('mikrotik', 'syncInterval', e.target.value)}
                      className="text-xs bg-transparent border-none font-bold text-slate-700 focus:ring-0 cursor-pointer"
                    >
                      <option value="manual">Manual</option>
                      <option value="hourly">A cada hora</option>
                      <option value="daily">Diariamente</option>
                    </select>
                 </div>
                 <div 
                    onClick={() => updateConfig('mikrotik', 'enabled', !config.mikrotik.enabled)}
                    className={`w-10 h-5 rounded-full relative cursor-pointer transition-all ${config.mikrotik.enabled ? 'bg-indigo-500' : 'bg-slate-300'}`}
                 >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config.mikrotik.enabled ? 'left-6' : 'left-1'}`}></div>
                 </div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900">MikroTik RouterOS API</h3>
            <p className="text-sm text-slate-500 mt-1">Importa interfaces e DHCP Leases automaticamente.</p>
          </div>
          
          <div className="p-8 space-y-4 flex-1">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">IP / Hostname</label>
                <input 
                  type="text" 
                  value={config.mikrotik.host}
                  onChange={(e) => updateConfig('mikrotik', 'host', e.target.value)}
                  placeholder="192.168.88.1" 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Porta API</label>
                <input 
                  type="text" 
                  value={config.mikrotik.port}
                  onChange={(e) => updateConfig('mikrotik', 'port', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Usuário</label>
                <input 
                  type="text" 
                  value={config.mikrotik.user}
                  onChange={(e) => updateConfig('mikrotik', 'user', e.target.value)}
                  placeholder="admin" 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Senha</label>
                <div className="relative">
                  <input 
                    type={showPass.mikrotik ? "text" : "password"} 
                    value={config.mikrotik.pass}
                    onChange={(e) => updateConfig('mikrotik', 'pass', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                  />
                  <button onClick={() => togglePass('mikrotik')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPass.mikrotik ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {testResult.mikrotik && (
              <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-medium ${testResult.mikrotik.success ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                {testResult.mikrotik.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {testResult.mikrotik.message}
              </div>
            )}
          </div>

          <div className="p-8 pt-0 mt-auto flex gap-3">
             <button 
              disabled={!!testing || !!syncing}
              onClick={() => handleTest('mikrotik')}
              className="flex-1 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {testing === 'mikrotik' ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
              Testar Conexão
            </button>
            <button 
              disabled={!!syncing || !!testing}
              onClick={() => handleSync('mikrotik')}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              {syncing === 'mikrotik' ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
              Sincronizar
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 bg-amber-50 border border-amber-100 rounded-3xl p-6 flex gap-4">
        <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl shrink-0">
          <AlertCircle size={24} />
        </div>
        <div>
          <h4 className="font-bold text-amber-900">Aviso sobre Segurança e CORS</h4>
          <p className="text-sm text-amber-800/70 mt-1 leading-relaxed">
            Navegadores bloqueiam requisições diretas a IPs locais (CORS). Para que a integração funcione em ambiente de produção, certifique-se de usar um <strong>CORS Proxy</strong> ou execute o NetManager Pro via Docker na mesma rede dos controladores. Use usuários de apenas leitura (read-only) sempre que possível.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsTab;
