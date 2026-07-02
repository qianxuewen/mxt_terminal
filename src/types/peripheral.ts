/** 外设管理相关类型 */

export type PeripheralCategory = 'usb' | 'printer' | 'camera' | 'microphone' | 'smartcard' | 'storage' | 'keyboard' | 'mouse' | 'other';
export type PeripheralStatus = 'connected' | 'disconnected' | 'redirecting' | 'redirected' | 'error';
export type RedirectPolicy = 'allow' | 'deny' | 'ask';

export interface PeripheralDevice {
  id: string;
  name: string;
  vendor: string;
  vendorId: string;
  productId: string;
  category: PeripheralCategory;
  status: PeripheralStatus;
  description?: string;
  busType?: string;
  serialNumber?: string;
  driverInstalled: boolean;
}

export interface USBDevice extends PeripheralDevice {
  category: 'usb';
  usbClass: number;
  usbSubclass: number;
  protocol: number;
  speed: 'low' | 'full' | 'high' | 'super';
}

export interface PrinterInfo {
  id: string;
  name: string;
  model: string;
  vendor: string;
  status: 'online' | 'offline' | 'error';
  type: 'local' | 'network';
  isDefault: boolean;
  driverInstalled: boolean;
  driverName?: string;
  duplexCapable: boolean;
  colorCapable: boolean;
}

export interface CameraInfo {
  id: string;
  name: string;
  model: string;
  resolution: string;      // e.g. "1920x1080"
  fps: number;
  status: PeripheralStatus;
  redirected: boolean;
}

export interface AudioDevice {
  id: string;
  name: string;
  type: 'input' | 'output';
  device: string;
  status: PeripheralStatus;
  muted: boolean;
  volume: number;
}

export interface PeripheralPolicy {
  category: PeripheralCategory;
  policy: RedirectPolicy;
  whitelist?: string[];       // device IDs
  blacklist?: string[];
  readOnly?: boolean;
}

export interface PrinterMapping {
  id: string;
  localPrinterId: string;
  remotePrinterName: string;
  mapped: boolean;
  driverName?: string;
  options?: Record<string, string>;
}
