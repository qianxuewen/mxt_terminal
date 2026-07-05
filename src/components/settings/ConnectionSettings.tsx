import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from '@/components/common/Toast';
import { theme, inputStyle, labelStyle, toggleBtnStyle } from '@/theme';

const PORT_OPTIONS = {
  device: [
    { type: 'lan' as const, label: '局域网', port: 60442 },
    { type: 'wan' as const, label: '广域网', port: 60443 },
  ],
  service: [
    { type: 'lan' as const, label: '局域网', port: 8888 },
    { type: 'wan' as const, label: '广域网', port: 8889 },
  ],
};

type CheckStatus = 'idle' | 'checking' | 'done';

const ConnectionSettings: React.FC = () => {
  const navigate = useNavigate();
  const { settings, saveSettings, saving } = useSettingsStore();
  const conn = settings.connection;

  const [host, setHost] = useState(conn.host);
  const [devicePortType, setDevicePortType] = useState<'lan' | 'wan' | 'other'>(conn.devicePortType);
  const [devicePortCustom, setDevicePortCustom] = useState(
    conn.devicePortType === 'other' ? String(conn.devicePort) : ''
  );
  const [servicePortType, setServicePortType] = useState<'lan' | 'wan' | 'other'>(conn.servicePortType);
  const [servicePortCustom, setServicePortCustom] = useState(
    conn.servicePortType === 'other' ? String(conn.servicePort) : ''
  );

  // Connection check results
  const [checkStatus, setCheckStatus] = useState<CheckStatus>('idle');
  const [step, setStep] = useState(0); // 0=idle, 1~5 用于强制逐帧渲染
  const [networkOk, setNetworkOk] = useState(false);
  const [serverIpOk, setServerIpOk] = useState(false);
  const [devicePortOk, setDevicePortOk] = useState(false);
  const [servicePortOk, setServicePortOk] = useState(false);
  const [registered, setRegistered] = useState(false);

  const getDevicePort = () => {
    if (devicePortType === 'other') return parseInt(devicePortCustom) || 0;
    return PORT_OPTIONS.device.find(o => o.type === devicePortType)!.port;
  };

  const getServicePort = () => {
    if (servicePortType === 'other') return parseInt(servicePortCustom) || 0;
    return PORT_OPTIONS.service.find(o => o.type === servicePortType)!.port;
  };

  /** Probe a TCP port — Tauri native, WebSocket probe, then HTTP fetch fallback */
  const probePort = async (targetHost: string, port: number, timeout = 2000): Promise<boolean> => {
    // 1. Tauri native TCP check
    try {
      const { invoke } = await import('@tauri-apps/api/tauri');
      return await invoke('check_port', { host: targetHost, port, timeoutMs: timeout });
    } catch {}

    // 2. WebSocket probe — any response means TCP handshake succeeded
    try {
      return await new Promise<boolean>((resolve) => {
        const ws = new WebSocket(`ws://${targetHost}:${port}`);
        const timer = setTimeout(() => { ws.close(); resolve(false); }, timeout);
        ws.onopen = () => { clearTimeout(timer); ws.close(); resolve(true); };
        ws.onerror = () => { clearTimeout(timer); ws.close(); resolve(true); };
      });
    } catch {}

    // 3. HTTP fetch fallback
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);
      await fetch(`http://${targetHost}:${port}`, {
        method: 'HEAD', signal: controller.signal, mode: 'no-cors', cache: 'no-store',
      });
      clearTimeout(timer);
      return true;
    } catch { return false; }
  };

  /** Check network: gateway first, then fallback to public probes */
  const checkNetwork = async (): Promise<boolean> => {
    const probes: { url: string; noCors: boolean }[] = [];

    // Gateway: use no-cors for TCP-level probe (avoids CORS block on router admin page)
    const gateway = settings.network.gateway;
    if (gateway) {
      probes.push({ url: `http://${gateway}`, noCors: true });
    }

    // Public probes: normal fetch
    probes.push(
      { url: 'https://8.8.8.8', noCors: false },
      { url: 'https://1.1.1.1', noCors: false },
      { url: 'https://www.baidu.com', noCors: false },
    );

    for (const { url, noCors } of probes) {
      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 2000);
        await fetch(url, {
          method: 'HEAD',
          signal: controller.signal,
          ...(noCors ? { mode: 'no-cors' as RequestMode } : {}),
        });
        clearTimeout(id);
        return true;
      } catch {}
    }
    return false;
  };

  // Start connection check
  const handleConnect = () => {
    if (!host) {
      toast.warning('请输入服务器 IP 地址');
      return;
    }

    saveSettings({
      connection: { ...conn, host, devicePortType, devicePort: getDevicePort(), servicePortType, servicePort: getServicePort() },
    });

    // Reset and start step-by-step detection
    setCheckStatus('checking');
    setNetworkOk(false);
    setServerIpOk(false);
    setDevicePortOk(false);
    setServicePortOk(false);
    setRegistered(false);
    setStep(1);
  };

  // Step-driven detection: each step change triggers the next check
  useEffect(() => {
    if (step === 0 || checkStatus !== 'checking') return;

    const devicePort = getDevicePort();
    const servicePort = getServicePort();

    const runStep = async () => {
      try {
        if (step === 1) {
          // 检测网络
          await new Promise(r => setTimeout(r, 600));
          const r = await checkNetwork();
          setNetworkOk(r);
          if (!r) {
            setCheckStatus('done');
            toast.error('网络不可用，请检查网络设置');
            navigate('/settings', { state: { tab: 'network' }, replace: true });
          } else {
            setStep(2);
          }
        } else if (step === 2) {
          // 服务器 IP 连通性由后续端口检测验证，跳过单独探测
          setServerIpOk(true);
          setStep(3);
        } else if (step === 3) {
          // 检测设备端口
          await new Promise(r => setTimeout(r, 600));
          const r = await probePort(host, devicePort, 2000);
          setDevicePortOk(r);
          setStep(4);
        } else if (step === 4) {
          // 检测业务端口
          await new Promise(r => setTimeout(r, 600));
          const r = await probePort(host, servicePort, 2000);
          setServicePortOk(r);
          setRegistered(r || devicePortOk);
          setStep(5);
        } else if (step === 5) {
          // 完成
          setCheckStatus('done');
          if (devicePortOk && servicePortOk) {
            toast.success('连接成功');
          } else if (!devicePortOk && !servicePortOk) {
            toast.warning('IP 已连通，但端口探测无响应');
          } else {
            toast.warning('部分端口连接异常');
          }
        }
      } catch {
        if (step === 5) {
          setCheckStatus('done');
          toast.error('连接检测失败');
        }
      }
    };

    runStep();
  }, [step, checkStatus]);

  const isChecking = checkStatus === 'checking';

  return (
    <div style={{ maxWidth: 700 }}>
      <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700, color: theme.textPrimary }}>接入设置</h2>
      <p style={{ color: theme.textTertiary, fontSize: 13, marginBottom: 24 }}>
        配置服务器连接参数，包括设备端口和业务端口
      </p>

      {/* 服务器 IP */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: theme.textPrimary }}>服务器 IP</h3>
        <div style={{ maxWidth: 400 }}>
          <input
            style={inputStyle}
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder="例如: 192.168.201.131"
            disabled={isChecking}
          />
        </div>
      </div>

      {/* 设备端口 */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: theme.textPrimary, minWidth: 80 }}>设备端口</span>
          <select style={{ ...inputStyle, width: 160 }} value={devicePortType} onChange={(e) => setDevicePortType(e.target.value as any)} disabled={isChecking}>
            <option value="lan">局域网</option>
            <option value="wan">广域网</option>
            <option value="other">其它</option>
          </select>
          {devicePortType === 'other' ? (
            <input style={{ ...inputStyle, width: 140 }} type="number" placeholder="输入端口" value={devicePortCustom} onChange={(e) => setDevicePortCustom(e.target.value)} disabled={isChecking} />
          ) : (
            <div style={{ padding: '10px 14px', background: theme.bgInput, borderRadius: 6, color: theme.textSecondary, fontSize: 14, width: 140, border: `1px solid ${theme.borderInput}` }}>
              {PORT_OPTIONS.device.find(o => o.type === devicePortType)!.port}
            </div>
          )}
        </div>
      </div>

      {/* 业务端口 */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: theme.textPrimary, minWidth: 80 }}>业务端口</span>
          <select style={{ ...inputStyle, width: 160 }} value={servicePortType} onChange={(e) => setServicePortType(e.target.value as any)} disabled={isChecking}>
            <option value="lan">局域网</option>
            <option value="wan">广域网</option>
            <option value="other">其它</option>
          </select>
          {servicePortType === 'other' ? (
            <input style={{ ...inputStyle, width: 140 }} type="number" placeholder="输入端口" value={servicePortCustom} onChange={(e) => setServicePortCustom(e.target.value)} disabled={isChecking} />
          ) : (
            <div style={{ padding: '10px 14px', background: theme.bgInput, borderRadius: 6, color: theme.textSecondary, fontSize: 14, width: 140, border: `1px solid ${theme.borderInput}` }}>
              {PORT_OPTIONS.service.find(o => o.type === servicePortType)!.port}
            </div>
          )}
        </div>
      </div>

      {/* 连接状态 */}
      <div style={{
        marginBottom: 28,
        background: theme.bgCard, borderRadius: theme.radiusLg, padding: 20,
        border: `1px solid ${theme.border}`,
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: theme.textPrimary }}>
          连接状态
          {isChecking && <span style={{ marginLeft: 8, fontSize: 12, color: theme.textTertiary }}>正在检测...</span>}
        </h3>

        <StatusRow label="网络" connected={networkOk} state={step >= 2 || checkStatus === 'done' ? 'done' : checkStatus}
          detail={step < 1 ? '待检测' : step < 2 ? '检测中...' : networkOk ? '已连接' : '未连接'} />
        <StatusRow label="服务器 IP" connected={serverIpOk} state={step >= 3 || checkStatus === 'done' ? 'done' : checkStatus}
          detail={step < 2 ? '待检测' : step < 3 ? '检测中...' : serverIpOk ? `${host} 可达` : `${host} 不可达`} />
        <StatusRow label="设备端口" connected={devicePortOk} state={step >= 4 || checkStatus === 'done' ? 'done' : checkStatus}
          detail={checkStatus === 'done' && step < 4 ? '已跳过' : step < 3 ? '待检测' : step < 4 ? '检测中...' : devicePortOk ? `端口 ${getDevicePort()} 已连接 ✓` : `端口 ${getDevicePort()} 未连接 ✕`} />
        <StatusRow label="业务端口" connected={servicePortOk} state={step >= 5 || checkStatus === 'done' ? 'done' : checkStatus}
          detail={checkStatus === 'done' && step < 5 ? '已跳过' : step < 4 ? '待检测' : step < 5 ? '检测中...' : servicePortOk ? `端口 ${getServicePort()} 已连接 ✓` : `端口 ${getServicePort()} 未连接 ✕`} />
        <StatusRow label="终端注册" connected={registered} state={checkStatus === 'done' ? 'done' : checkStatus}
          detail={checkStatus !== 'done' ? '检测中...' : registered ? '已添加' : '未添加'} />
      </div>

      <button
        onClick={handleConnect}
        disabled={isChecking}
        style={{
          padding: '12px 48px',
          background: isChecking ? theme.primary + '80' : theme.gradientPrimary,
          border: 'none', borderRadius: theme.radius,
          color: theme.textOnPrimary,
          fontSize: 15, fontWeight: 600,
          cursor: isChecking ? 'not-allowed' : 'pointer',
          letterSpacing: 2,
        }}
      >
        {isChecking ? '检测中...' : '连 接'}
      </button>
    </div>
  );
};

const StatusRow: React.FC<{
  label: string;
  connected: boolean;
  state: 'idle' | 'checking' | 'done';
  detail: string;
}> = ({ label, connected, state, detail }) => {
  const gray = '#C0C8D4';
  const dotColor = state === 'idle' ? gray : state === 'checking' ? '#F5A623' : connected ? theme.success : '#FF4D4F';
  const textColor = state === 'idle' ? theme.textTertiary : state === 'checking' ? '#F5A623' : connected ? theme.success : '#FF4D4F';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 0', borderBottom: `1px solid ${theme.borderLight}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: dotColor,
          display: 'inline-block',
        }} />
        <span style={{ color: theme.textPrimary, fontSize: 14 }}>{label}</span>
      </div>
      <span style={{ color: textColor, fontSize: 13, fontWeight: 500 }}>
        {detail}
      </span>
    </div>
  );
};

export default ConnectionSettings;
