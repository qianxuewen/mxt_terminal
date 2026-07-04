import React, { useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import Modal from '@/components/common/Modal';
import { toast } from '@/components/common/Toast';
import { theme, inputStyle, labelStyle, cardStyle } from '@/theme';
import type { IPMode } from '@/types/settings';

/** 需要账密的认证方式 */
const NEEDS_CREDENTIALS = ['pppoe', '8021x', 'l2tp', 'pptp'];

const PORTAL_TYPES = [
  { value: 'none' as const, label: '无' },
  { value: 'web' as const, label: 'Web 认证' },
  { value: 'pppoe' as const, label: 'PPPoE 拨号' },
  { value: '8021x' as const, label: '802.1X' },
  { value: 'l2tp' as const, label: 'L2TP' },
  { value: 'pptp' as const, label: 'PPTP' },
];

const NetworkSettings: React.FC = () => {
  const { settings, saveSettings, saving } = useSettingsStore();
  const net = settings.network;

  const [ipMode, setIpMode] = useState<IPMode>(net.ipMode);
  const [ipAddress, setIpAddress] = useState(net.ipAddress);
  const [subnetMask, setSubnetMask] = useState(net.subnetMask);
  const [gateway, setGateway] = useState(net.gateway);
  const [dns1, setDns1] = useState(net.dnsServers[0] || '');
  const [dns2, setDns2] = useState(net.dnsServers[1] || '');
  const [proxyEnabled, setProxyEnabled] = useState(net.proxyEnabled);
  const [portalAuth, setPortalAuth] = useState(net.portalAuth);
  const [portalType, setPortalType] = useState(net.portalType);
  const [portalUsername, setPortalUsername] = useState(net.portalUsername);
  const [portalPassword, setPortalPassword] = useState(net.portalPassword);
  const [portalUrl, setPortalUrl] = useState('http://192.168.1.1');
  const [showPortalModal, setShowPortalModal] = useState(false);

  const handleSave = () => {
    saveSettings({
      network: {
        ...net,
        ipMode,
        ipAddress,
        subnetMask,
        gateway,
        dnsServers: [dns1, dns2].filter(Boolean),
        proxyEnabled,
        portalAuth,
        portalType,
        portalUsername,
        portalPassword,
      },
    });
    toast.success('网络设置已保存');
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700, color: theme.textPrimary }}>网络设置</h2>
      <p style={{ color: theme.textTertiary, fontSize: 13, marginBottom: 24 }}>
        配置网络连接参数，包括 IP 地址、DNS 和认证方式
      </p>

      {/* ── IP 模式 ── */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: theme.textPrimary }}>IP 设置</h3>
        <div style={{ marginBottom: 16 }}>
          <select style={{ ...inputStyle, maxWidth: 300 }} value={ipMode} onChange={(e) => setIpMode(e.target.value as IPMode)}>
            <option value="dhcp">DHCP（自动获取）</option>
            <option value="static">静态 IP</option>
          </select>
        </div>

        {ipMode === 'static' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>IP 地址</label>
              <input style={inputStyle} value={ipAddress} onChange={(e) => setIpAddress(e.target.value)} placeholder="192.168.1.100" />
            </div>
            <div>
              <label style={labelStyle}>子网掩码</label>
              <input style={inputStyle} value={subnetMask} onChange={(e) => setSubnetMask(e.target.value)} placeholder="255.255.255.0" />
            </div>
            <div>
              <label style={labelStyle}>默认网关</label>
              <input style={inputStyle} value={gateway} onChange={(e) => setGateway(e.target.value)} placeholder="192.168.1.1" />
            </div>
          </div>
        )}

        {ipMode === 'dhcp' && (
          <div style={{ background: theme.bgInput, borderRadius: theme.radius, padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <span style={{ color: theme.textTertiary, fontSize: 11 }}>IP 地址</span>
                <div style={{ color: theme.textPrimary, fontSize: 14, fontWeight: 500 }}>192.168.1.100</div>
              </div>
              <div>
                <span style={{ color: theme.textTertiary, fontSize: 11 }}>子网掩码</span>
                <div style={{ color: theme.textPrimary, fontSize: 14, fontWeight: 500 }}>255.255.255.0</div>
              </div>
              <div>
                <span style={{ color: theme.textTertiary, fontSize: 11 }}>默认网关</span>
                <div style={{ color: theme.textPrimary, fontSize: 14, fontWeight: 500 }}>192.168.1.1</div>
              </div>
              <div>
                <span style={{ color: theme.textTertiary, fontSize: 11 }}>DNS</span>
                <div style={{ color: theme.textPrimary, fontSize: 14, fontWeight: 500 }}>8.8.8.8 / 114.114.114.114</div>
              </div>
            </div>
            <div style={{ marginTop: 8, color: theme.textTertiary, fontSize: 11 }}>由 DHCP 自动分配</div>
          </div>
        )}
      </div>

      {/* ── DNS ── */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: theme.textPrimary }}>DNS 设置</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>首选 DNS</label>
            <input style={inputStyle} value={dns1} onChange={(e) => setDns1(e.target.value)} placeholder="8.8.8.8" />
          </div>
          <div>
            <label style={labelStyle}>备用 DNS</label>
            <input style={inputStyle} value={dns2} onChange={(e) => setDns2(e.target.value)} placeholder="114.114.114.114" />
          </div>
        </div>
      </div>

      {/* ── 代理 ── */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: theme.textPrimary }}>代理设置</h3>
        <div style={{ marginBottom: 12 }}>
          <select style={{ ...inputStyle, maxWidth: 300 }} value={proxyEnabled ? 'on' : 'off'} onChange={(e) => setProxyEnabled(e.target.value === 'on')}>
            <option value="off">关闭</option>
            <option value="on">开启</option>
          </select>
        </div>
        {proxyEnabled && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>代理类型</label>
              <select style={inputStyle} defaultValue={net.proxyType}>
                <option value="http">HTTP</option>
                <option value="socks5">SOCKS5</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>代理地址</label>
              <input style={inputStyle} defaultValue={net.proxyHost} placeholder="127.0.0.1" />
            </div>
            <div>
              <label style={labelStyle}>代理端口</label>
              <input style={inputStyle} type="number" defaultValue={net.proxyPort || ''} placeholder="1080" />
            </div>
          </div>
        )}
      </div>

      {/* ── 接入认证 ── */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: theme.textPrimary }}>接入认证</h3>
        <p style={{ color: theme.textTertiary, fontSize: 13, marginBottom: 12 }}>开启后需要认证才能访问网络</p>
        <div style={{ marginBottom: 16 }}>
          <select style={{ ...inputStyle, maxWidth: 300 }} value={portalAuth ? 'on' : 'off'} onChange={(e) => { setPortalAuth(e.target.value === 'on'); if (e.target.value === 'on') setPortalType('web'); }}>
            <option value="off">关闭</option>
            <option value="on">开启</option>
          </select>
        </div>

        {portalAuth && (
          <div style={{ ...cardStyle, padding: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>认证方式</label>
              <select style={inputStyle} value={portalType} onChange={(e) => setPortalType(e.target.value as any)}>
                {PORTAL_TYPES.filter(t => t.value !== 'none').map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {portalType === 'web' && (
              <div style={{ padding: '8px 0' }}>
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>认证页面地址</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      style={{ flex: 1, ...inputStyle }}
                      value={portalUrl}
                      onChange={(e) => setPortalUrl(e.target.value)}
                      placeholder="http://192.168.1.1"
                    />
                    <button
                      onClick={() => setShowPortalModal(true)}
                      style={{
                        padding: '10px 24px', whiteSpace: 'nowrap',
                        background: theme.gradientPrimary,
                        border: 'none', borderRadius: theme.radius,
                        color: '#fff', fontSize: 13, fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      打开页面
                    </button>
                  </div>
                </div>
              </div>
            )}

            {NEEDS_CREDENTIALS.includes(portalType) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>用户名</label>
                  <input style={inputStyle} value={portalUsername} onChange={(e) => setPortalUsername(e.target.value)} placeholder="认证用户名" />
                </div>
                <div>
                  <label style={labelStyle}>密码</label>
                  <input style={inputStyle} type="password" value={portalPassword} onChange={(e) => setPortalPassword(e.target.value)} placeholder="认证密码" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 高级设置 ── */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: theme.textPrimary }}>高级设置</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 0' }}>
          <div>
            <label style={labelStyle}>QUIC 传输协议</label>
            <select style={{ ...inputStyle, maxWidth: 200 }} defaultValue="off">
              <option value="off">关闭</option>
              <option value="on">开启</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>带宽限制 (Mbps, 0=不限)</label>
            <input style={{ ...inputStyle, maxWidth: 200 }} type="number" defaultValue={net.bandwidthLimit} />
          </div>
        </div>
      </div>

      {/* Portal 认证页面 - 内嵌 iframe */}
      <Modal
        open={showPortalModal}
        title="Web 认证"
        width={800}
        onClose={() => setShowPortalModal(false)}
      >
        <div style={{ width: '100%', height: '70vh', borderRadius: 8, overflow: 'hidden' }}>
          <iframe
            src={portalUrl}
            style={{ width: '100%', height: '100%', border: 'none', borderRadius: 8 }}
            title="Portal 认证"
            sandbox="allow-same-origin allow-forms allow-scripts"
          />
        </div>
      </Modal>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          padding: '10px 32px',
          background: theme.gradientPrimary,
          border: 'none', borderRadius: theme.radius,
          color: theme.textOnPrimary,
          fontSize: 14, fontWeight: 600,
          cursor: saving ? 'not-allowed' : 'pointer',
        }}
      >
        {saving ? '保存中...' : '保存设置'}
      </button>
    </div>
  );
};

export default NetworkSettings;
