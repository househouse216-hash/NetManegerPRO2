
import { Equipment, IPAMEntry, PortMapping, WANProvider, DeviceStatus, DeviceType } from './types';

export const INITIAL_EQUIPMENT: Equipment[] = [
  {
    id: '1',
    name: 'Roteador Principal',
    type: DeviceType.Router,
    model: 'Ubiquiti UDM Pro',
    location: 'Rack 1 - Sala TI',
    ip: '192.168.1.1',
    mac: 'AA:BB:CC:DD:EE:01',
    firmware: 'v3.1.15',
    status: DeviceStatus.Ativo
  },
  {
    id: '2',
    name: 'Switch Core',
    type: DeviceType.Switch,
    model: 'USW-Pro-24',
    location: 'Rack 1 - Sala TI',
    ip: '192.168.1.2',
    mac: 'AA:BB:CC:DD:EE:02',
    firmware: 'v6.5.59',
    status: DeviceStatus.Ativo
  }
];

export const INITIAL_IPAM: IPAMEntry[] = [
  {
    id: '1',
    deviceName: 'Roteador Principal',
    ip: '192.168.1.1',
    mask: '255.255.255.0',
    gateway: '---',
    vlanId: '1',
    type: 'Estático',
    notes: 'Gateway Padrão'
  }
];

export const INITIAL_MAPPINGS: PortMapping[] = [
  {
    id: '1',
    patchPanelPort: 'A01',
    endDevice: 'PC Financeiro 01',
    destinationSwitch: 'Switch Core',
    switchPort: 'Port 5',
    vlan: '10',
    cableType: 'Cat6'
  }
];

export const INITIAL_WAN: WANProvider[] = [
  {
    id: '1',
    isp: 'Vivo Fibra',
    connectionType: 'Fibra Óptica',
    speed: '600 Mbps',
    publicIp: '201.45.12.189',
    contact: '0800-VIVO-NEGOCIOS',
    contractNumber: '881239921'
  }
];
