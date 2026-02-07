
import { Equipment, DeviceType, DeviceStatus, IPAMEntry } from '../types';

/**
 * Note: Real-world browser environments face CORS issues when calling local APIs.
 * This implementation provides the logic for synchronization, using mock responses 
 * that mirror the actual structure of UniFi and MikroTik API outputs.
 */

export const testConnection = async (provider: 'unifi' | 'mikrotik', config: any): Promise<{ success: boolean; message: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (provider === 'unifi') {
    if (!config.url.startsWith('http')) return { success: false, message: 'URL Inválida (Deve começar com http/https)' };
    if (config.user === 'error') return { success: false, message: 'Autenticação Inválida (401)' };
    if (config.url.includes('offline')) return { success: false, message: 'Host não encontrado ou Timeout (ETIMEDOUT)' };
  } else {
    if (!config.host) return { success: false, message: 'IP/Host não informado' };
    if (config.user === 'error') return { success: false, message: 'Autenticação RouterOS falhou' };
    if (config.host.includes('255')) return { success: false, message: 'Rede Inalcançável (No route to host)' };
  }

  return { success: true, message: 'Conexão estabelecida com sucesso!' };
};

export const syncUniFiData = async (config: any): Promise<{ equipment: Equipment[], ipam: IPAMEntry[] }> => {
  const test = await testConnection('unifi', config);
  if (!test.success) throw new Error(test.message);

  await new Promise(resolve => setTimeout(resolve, 800));

  const mockUniFiDevices = [
    { name: 'U6-Pro-Hall', model: 'U6PRO', type: 'uap', ip: '192.168.1.10', mac: '78:45:58:AA:BB:01', version: '6.5.62', state: 1 },
    { name: 'USW-Lite-16', model: 'USL16P', type: 'usw', ip: '192.168.1.5', mac: '78:45:58:AA:CC:02', version: '6.5.59', state: 1 },
    { name: 'UXG-Lite', model: 'UXGLite', type: 'ugw', ip: '192.168.1.1', mac: '78:45:58:AA:DD:03', version: '3.1.16', state: 1 }
  ];

  const equipment: Equipment[] = mockUniFiDevices.map(d => ({
    id: `unifi-${d.mac}`,
    name: d.name,
    type: d.type === 'uap' ? DeviceType.AP : d.type === 'usw' ? DeviceType.Switch : DeviceType.Router,
    model: d.model,
    location: 'UniFi Managed',
    ip: d.ip,
    mac: d.mac,
    firmware: d.version,
    status: d.state === 1 ? DeviceStatus.Ativo : DeviceStatus.Offline,
    observations: 'Sincronizado via UniFi Controller API',
    source: 'UniFi',
    lastSeen: new Date().toLocaleString()
  }));

  const ipam: IPAMEntry[] = mockUniFiDevices.map(d => ({
    id: `ipam-unifi-${d.mac}`,
    deviceName: d.name,
    ip: d.ip,
    mask: '255.255.255.0',
    gateway: '192.168.1.1',
    vlanId: '1',
    type: 'Estático',
    notes: `Ativo UniFi (${d.model})`,
    source: 'UniFi'
  }));

  return { equipment, ipam };
};

export const syncMikroTikData = async (config: any): Promise<{ equipment: Equipment[], ipam: IPAMEntry[] }> => {
  const test = await testConnection('mikrotik', config);
  if (!test.success) throw new Error(test.message);

  await new Promise(resolve => setTimeout(resolve, 1000));

  const mockLeases = [
    { host_name: 'PC-ADMIN', address: '192.168.88.50', mac_address: '00:15:5D:01:02:03', comment: 'Financeiro' },
    { host_name: 'CCTV-01', address: '192.168.88.200', mac_address: 'B8:27:EB:AA:BB:CC', comment: 'Câmera Entrada' }
  ];

  const ipam: IPAMEntry[] = mockLeases.map(l => ({
    id: `mikro-${l.mac_address}`,
    deviceName: l.host_name || 'Generic MikroTik Lease',
    ip: l.address,
    mask: '255.255.255.0',
    gateway: config.host,
    vlanId: '88',
    type: 'DHCP',
    notes: l.comment || 'Importado via RouterOS API',
    source: 'MikroTik'
  }));

  const equipment: Equipment[] = [{
    id: `mikro-core-${config.host}`,
    name: 'MikroTik Core Router',
    type: DeviceType.Router,
    model: 'RB5009',
    location: 'Central Rack',
    ip: config.host,
    mac: 'E4:8D:8C:01:02:03',
    firmware: 'RouterOS v7.12',
    status: DeviceStatus.Ativo,
    source: 'MikroTik',
    observations: 'Dispositivo Principal MikroTik'
  }];

  return { equipment, ipam };
};
