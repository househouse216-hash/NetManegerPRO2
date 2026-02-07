
export enum DeviceStatus {
  Ativo = 'Ativo',
  Manutencao = 'Em Manutenção',
  Estoque = 'Estoque',
  Offline = 'Offline'
}

export enum DeviceType {
  Modem = 'Modem',
  Switch = 'Switch',
  Firewall = 'Firewall',
  AP = 'Access Point',
  Server = 'Servidor',
  Router = 'Roteador'
}

export interface Equipment {
  id: string;
  name: string;
  type: DeviceType;
  model: string;
  location: string;
  ip: string;
  mac: string;
  firmware: string;
  status: DeviceStatus;
  observations?: string;
  lastSeen?: string;
  source?: 'Manual' | 'UniFi' | 'MikroTik';
  uptime?: string;
  cpuUsage?: number;
  ramUsage?: number;
  temperature?: number;
}

export interface IPAMEntry {
  id: string;
  deviceName: string;
  ip: string;
  mask: string;
  gateway: string;
  vlanId: string;
  type: 'Estático' | 'DHCP' | 'Reservado';
  notes: string;
  source?: 'Manual' | 'UniFi' | 'MikroTik';
}

export interface PortMapping {
  id: string;
  patchPanelPort: string;
  endDevice: string;
  destinationSwitch: string;
  switchPort: string;
  vlan: string;
  cableType: 'Cat5e' | 'Cat6' | 'Fiber';
}

export interface WANProvider {
  id: string;
  isp: string;
  connectionType: string;
  speed: string;
  publicIp: string;
  contact: string;
  contractNumber: string;
}

export type TabType = 'inventory' | 'ipam' | 'mapping' | 'wan' | 'diagram' | 'ai' | 'integrations';

export type SyncInterval = 'manual' | 'hourly' | 'daily';

export interface IntegrationSettings {
  unifi: {
    url: string;
    user: string;
    pass: string;
    site: string;
    enabled: boolean;
    syncInterval: SyncInterval;
    ignoreSsl: boolean;
  };
  mikrotik: {
    host: string;
    user: string;
    pass: string;
    port: string;
    enabled: boolean;
    syncInterval: SyncInterval;
    useSsl: boolean;
  };
}
