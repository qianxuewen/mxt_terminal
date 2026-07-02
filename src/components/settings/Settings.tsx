import React, { useState } from 'react';
import ConnectionSettings from './ConnectionSettings';
import DisplaySettings from './DisplaySettings';
import PowerSettings from './PowerSettings';
import PeripheralSettings from './PeripheralSettings';
import NetworkSettings from './NetworkSettings';
import AccountSettings from './AccountSettings';
import FirmwareUpdate from './FirmwareUpdate';
import DeviceTimeSync from './DeviceTimeSync';
import DiagnosticTools from './DiagnosticTools';
import About from './About';

interface SettingsTab {
  key: string;
  label: string;
  icon: string;
  component: React.ReactNode;
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('connection');

  const tabs: SettingsTab[] = [
    { key: 'connection', label: '接入设置', icon: '🔗', component: <ConnectionSettings /> },
    { key: 'display', label: '屏幕设置', icon: '🖥', component: <DisplaySettings /> },
    { key: 'power', label: '电源设置', icon: '⚡', component: <PowerSettings /> },
    { key: 'peripheral', label: '外设设置', icon: '🔌', component: <PeripheralSettings /> },
    { key: 'network', label: '网络设置', icon: '🌐', component: <NetworkSettings /> },
    { key: 'account', label: '账户设置', icon: '👤', component: <AccountSettings /> },
    { key: 'firmware', label: '固件升级', icon: '📦', component: <FirmwareUpdate /> },
    { key: 'time', label: '设备校时', icon: '🕐', component: <DeviceTimeSync /> },
    { key: 'diagnostic', label: '诊断工具', icon: '🔍', component: <DiagnosticTools /> },
    { key: 'about', label: '关于终端', icon: 'ℹ️', component: <About /> },
  ];

  const containerStyle: React.CSSProperties = {
    display: 'flex', height: '100%', background: '#0a0a14',
  };

  const sidebarStyle: React.CSSProperties = {
    width: 200, borderRight: '1px solid rgba(255,255,255,0.06)',
    padding: '16px 0', overflow: 'auto', flexShrink: 0,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1, padding: '24px 32px', overflow: 'auto',
  };

  return (
    <div style={containerStyle}>
      {/* Settings Sidebar */}
      <div style={sidebarStyle}>
        <div style={{ padding: '0 16px', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff' }}>设置</h2>
        </div>
        {tabs.map((tab) => (
          <div
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 16px', margin: '2px 8px', borderRadius: 8,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
              background: activeTab === tab.key ? 'rgba(74,108,247,0.15)' : 'transparent',
              color: activeTab === tab.key ? '#4a6cf7' : '#999',
              fontSize: 14, transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { if (activeTab !== tab.key) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
            onMouseLeave={(e) => { if (activeTab !== tab.key) e.currentTarget.style.background = 'transparent'; }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </div>
        ))}
      </div>

      {/* Settings Content */}
      <div style={contentStyle}>
        {tabs.find((t) => t.key === activeTab)?.component}
      </div>
    </div>
  );
};

export default Settings;
