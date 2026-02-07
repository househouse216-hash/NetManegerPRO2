
import { Equipment, DeviceType, DeviceStatus, IPAMEntry } from '../types';

/**
 * Simula a verificação de SSL e Handshake da API.
 */
export const testConnection = async (provider: 'unifi' | 'mikrotik', config: any): Promise<{ success: boolean; message: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  if (provider === 'unifi') {
    if (!config.url.startsWith('https') && !config.ignoreSsl) {
      return { success: false, message: 'Erro SSL: O controlador exige HTTPS. Ative "Ignorar SSL" para conexões locais sem certificado válido.' };
    }
    if (config.user === 'error') return { success: false, message: '401 Unauthorized: Credenciais UniFi recusadas.' };
    if (config.url.includes('offline')) return { success: false, message: 'Timeout: O controlador UniFi não respondeu no tempo limite.' };
  } else {
    if (config.useSsl && config.port !== '8729') {
      return { success: false, message: 'Erro TLS: Porta 8729 é obrigatória para API-SSL no MikroTik.' };
    }
    if (!config.host) return { success: false, message: 'Host MikroTik não definido.' };
    if (config.user === 'error') return { success: false, message: 'RouterOS: Falha na autenticação via API.' };
  }

  return { success: true, message: 'Conexão segura estabelecida com sucesso!' };
};

export const syncUniFiData = async (config: any): Promise<{ equipment: Equipment[], ipam: IPAMEntry[] }> => {
  const test = await testConnection('unifi', config);
  if (!test.success) throw new Error(test.message);

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Coleta enriquecida com métricas de ambiente e hardware
  const mockUniFiDevices = [
    { name: 'U6-Pro-Main', model: 'U6-PRO', type: 'uap', ip: '192.168.1.10', mac: '78:45:58:AA:BB:01', version: '6.6.65', state: 1, uptime: '14d 2h', cpu: 12, ram: 35, temp: 42 },
    { name: 'Core-Switch-L16', model: 'USW-LITE-16-POE', type: 'usw', ip: '192.168.1.5', mac: '78:45:58:AA:CC:02', version: '6.5.59', state: 1, uptime: '48d 5h', cpu: 18, ram: 42, temp: 38 },
    { name: 'UXG-Gateway', model: 'UXG-LITE', type: 'ugw', ip: '192.168.1.1', mac: '78:45:58:AA:DD:03', version: '3.2.9', state: 1, uptime: '8d 14h', cpu: 48, ram: 60, temp: 51 }
  ];

  const equipment: Equipment[] = mockUniFiDevices.map(d => ({
    id: `unifi-${d.mac}`,
    name: d.name,
    type: d.type === 'uap' ? DeviceType.AP : d.type === 'usw' ? DeviceType.Switch : DeviceType.Router,
    model: d.model,
    location: 'UniFi Site: ' + config.site,
    ip: d.ip,
    mac: d.mac,
    firmware: d.version,
    status: d.state === 1 ? DeviceStatus.Ativo : DeviceStatus.Offline,
    observations: `Sync SSL ${config.ignoreSsl ? 'Insecure' : 'Verified'}. Monitoramento ativo.`,
    source: 'UniFi',
    lastSeen: new Date().toLocaleString(),
    uptime: d.uptime,
    cpuUsage: d.cpu,
    ramUsage: d.ram,
    temperature: d.temp
  }));

  const ipam: IPAMEntry[] = mockUniFiDevices.map(d => ({
    id: `ipam-unifi-${d.mac}`,
    deviceName: d.name,
    ip: d.ip,
    mask: '255.255.255.0',
    gateway: '192.168.1.1',
    vlanId: '1',
    type: 'Estático',
    notes: `Ativo Gerenciado UniFi (${d.model})`,
    source: 'UniFi'
  }));

  return { equipment, ipam };
};

export const syncMikroTikData = async (config: any): Promise<{ equipment: Equipment[], ipam: IPAMEntry[] }> => {
  const test = await testConnection('mikrotik', config);
  if (!test.success) throw new Error(test.message);

  await new Promise(resolve => setTimeout(resolve, 1500));

  // Coleta detalhada do RouterOS via API-SSL
  const mockLeases = [
    { host_name: 'Workstation-TI', address: '192.168.88.50', mac_address: '00:15:5D:01:02:03', comment: 'DHCP Pool' },
    { host_name: 'CCTV-DVR', address: '192.168.88.200', mac_address: 'B8:27:EB:AA:BB:CC', comment: 'Reserva Estática' }
  ];

  const ipam: IPAMEntry[] = mockLeases.map(l => ({
    id: `mikro-${l.mac_address}`,
    deviceName: l.host_name || 'Desconhecido (Lease)',
    ip: l.address,
    mask: '255.255.255.0',
    gateway: config.host,
    vlanId: '88',
    type: l.comment.includes('Estática') ? 'Reservado' : 'DHCP',
    notes: l.comment + (config.useSsl ? ' (Sync Seguro)' : ''),
    source: 'MikroTik'
  }));

  const equipment: Equipment[] = [{
    id: `mikro-router-${config.host}`,
    name: 'MikroTik Core Router',
    type: DeviceType.Router,
    model: 'RB5009UG+S+IN',
    location: 'Central Rack',
    ip: config.host,
    mac: 'E4:8D:8C:FF:AA:BB',
    firmware: 'RouterOS v7.14.3',
    status: DeviceStatus.Ativo,
    source: 'MikroTik',
    observations: `Acesso via API ${config.useSsl ? 'SSL (Porta 8729)' : 'Plain (Porta 8728)'}`,
    uptime: '156d 10h',
    cpuUsage: 12,
    ramUsage: 28,
    temperature: 44
  }];

  return { equipment, ipam };
};
