import React, { useState, useRef } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from '@/components/common/Toast';
import { theme, inputStyle, sectionTitleStyle, cardStyle } from '@/theme';

/** 持续模拟 Ping，每次回调返回一个结果，直到被中止 */
const mockPingStream = async (target: string, onReply: (seq: number, ttl: number, time: number) => void, signal: { aborted: boolean }) => {
  let seq = 0;
  while (!signal.aborted) {
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
    if (signal.aborted) return;
    onReply(++seq, 64 + Math.floor(Math.random() * 30), Math.round((10 + Math.random() * 90) * 100) / 100);
  }
};

const mockTraceroute = async (target: string, onHop: (hop: number, ip: string, time: number) => void, signal: { aborted: boolean }) => {
  const ips = ['192.168.1.1', '10.0.0.1', '172.16.1.2', '100.64.0.1', '218.30.53.1', '218.30.53.66', '219.158.3.1', target];
  for (let i = 0; i < ips.length; i++) {
    if (signal.aborted) return;
    await new Promise((r) => setTimeout(r, 300 + Math.random() * 200));
    if (signal.aborted) return;
    onHop(i + 1, ips[i], Math.round((2 + Math.random() * 10) * 10) / 10);
  }
};

const mockBandwidth = (): Promise<{ down: number; up: number; jitter: number }> =>
  new Promise((resolve) => setTimeout(() => resolve({ down: Math.round((50 + Math.random() * 150) * 10) / 10, up: Math.round((10 + Math.random() * 40) * 10) / 10, jitter: Math.round(Math.random() * 15 * 10) / 10 }), 3000));

const DiagnosticTools: React.FC = () => {
  const { diagnosticInfo, runDiagnostics, loading } = useSettingsStore();
  const [pingTarget, setPingTarget] = useState('192.168.201.131');
  const [traceTarget, setTraceTarget] = useState('192.168.201.131');
  const [pingResult, setPingResult] = useState<any>(null);
  const [traceResult, setTraceResult] = useState<any>(null);
  const [bwResult, setBwResult] = useState<any>(null);
  const [pingRunning, setPingRunning] = useState(false);
  const [traceRunning, setTraceRunning] = useState(false);
  const [bwRunning, setBwRunning] = useState(false);
  const [pingDone, setPingDone] = useState(false);
  const [traceDone, setTraceDone] = useState(false);
  const [bwDone, setBwDone] = useState(false);
  const pingAbort = useRef(false);
  const traceAbort = useRef(false);
  const bwAbort = useRef(false);

  const handlePing = async () => {
    if (pingRunning) { pingAbort.current = true; setPingRunning(false); return; }
    if (!pingTarget) { toast.warning('请输入目标地址'); return; }
    pingAbort.current = false;
    setPingRunning(true);
    setPingResult([]);
    const results: any[] = [];
    const signal = { get aborted() { return pingAbort.current; } };
    await mockPingStream(pingTarget, (seq, ttl, time) => {
      results.push({ seq, ttl, time });
      setPingResult([...results]);
    }, signal);
    if (!pingAbort.current) { setPingRunning(false); setPingDone(true); }
  };

  const handleTrace = async () => {
    if (traceRunning) { traceAbort.current = true; setTraceRunning(false); return; }
    if (!traceTarget) { toast.warning('请输入目标地址'); return; }
    traceAbort.current = false;
    setTraceRunning(true);
    setTraceResult([]);
    const results: any[] = [];
    const signal = { get aborted() { return traceAbort.current; } };
    await mockTraceroute(traceTarget, (hop, ip, time) => {
      results.push({ hop, ip, time });
      setTraceResult([...results]);
    }, signal);
    if (!traceAbort.current) { setTraceRunning(false); setTraceDone(true); }
  };

  const handleBandwidth = async () => {
    if (bwRunning) { bwAbort.current = true; setBwRunning(false); return; }
    bwAbort.current = false;
    setBwRunning(true);
    setBwResult(null);
    const r = await mockBandwidth();
    if (!bwAbort.current) { setBwResult(r); setBwRunning(false); setBwDone(true); }
  };

  const runningBtn = (text: string): React.CSSProperties => ({
    padding: '8px 20px', borderRadius: theme.radius, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', border: 'none',
    background: '#FF4D4F', color: '#fff',
  });
  const normalBtn: React.CSSProperties = {
    padding: '8px 20px', borderRadius: theme.radius, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', border: 'none',
    background: theme.gradientPrimary, color: '#fff',
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700, color: theme.textPrimary }}>诊断工具</h2>

      {/* Ping */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <h3 style={{ ...sectionTitleStyle, margin: 0 }}>Ping</h3>
          <span style={{ color: theme.textTertiary, fontSize: 12 }}>测试网络连通性及延迟</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input style={{ ...inputStyle, maxWidth: 260, opacity: pingRunning ? 0.6 : 1 }} value={pingTarget} onChange={(e) => setPingTarget(e.target.value)} placeholder="目标 IP 或域名" disabled={pingRunning} />
          <button onClick={handlePing} style={pingRunning ? runningBtn('结束 Ping') : normalBtn}>{pingRunning ? '结束 Ping' : pingDone ? '重新 Ping' : '开始 Ping'}</button>
        </div>
        {pingResult && (
          <div style={{ background: theme.bgInput, borderRadius: 8, padding: 12 }}>
            <div style={{ fontFamily: 'Consolas, monospace', fontSize: 12, lineHeight: 1.8 }}>
              <div style={{ color: theme.textTertiary, marginBottom: 4 }}>正在 Ping {pingTarget} 具有 32 字节的数据:</div>
              <div style={{ maxHeight: 150, overflowY: 'auto' }} ref={(el) => { if (el) el.scrollTop = el.scrollHeight; }}>
                {pingResult.map((r: any) => (
                  <div key={r.seq} style={{ color: theme.textPrimary }}>来自 {pingTarget} 的回复: 字节=32 时间={r.time}ms TTL={r.ttl}</div>
                ))}
              </div>
              {pingRunning && <div style={{ color: '#F5A623' }}>正在等待回复...</div>}
              {!pingRunning && pingResult.length > 0 && (
              <div style={{ color: theme.textTertiary, marginTop: 4 }}>已发送={pingResult.length} 已接收={pingResult.length} 丢包率=0% | 平均延迟={Math.round(pingResult.reduce((a: number, b: any) => a + b.time, 0) / pingResult.length * 100) / 100}ms</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Traceroute */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <h3 style={{ ...sectionTitleStyle, margin: 0 }}>Traceroute</h3>
          <span style={{ color: theme.textTertiary, fontSize: 12 }}>追踪到达目标的路由路径</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input style={{ ...inputStyle, maxWidth: 260, opacity: traceRunning ? 0.6 : 1 }} value={traceTarget} onChange={(e) => setTraceTarget(e.target.value)} placeholder="目标 IP 或域名" disabled={traceRunning} />
          <button onClick={handleTrace} style={traceRunning ? runningBtn('结束追踪') : normalBtn}>{traceRunning ? '结束追踪' : traceDone ? '重新追踪' : '开始追踪'}</button>
        </div>
        {traceResult && (
          <div style={{ background: theme.bgInput, borderRadius: 8, padding: 12 }}>
            <div style={{ fontFamily: 'Consolas, monospace', fontSize: 12, lineHeight: 1.8 }}>
              <div style={{ color: theme.textTertiary, marginBottom: 4 }}>通过最多 30 个跃点跟踪到 {traceTarget} 的路由:</div>
              <div style={{ maxHeight: 150, overflowY: 'auto', marginBottom: 4 }} ref={(el) => { if (el) el.scrollTop = el.scrollHeight; }}>
                {traceResult.map((r: any) => (
                  <div key={r.hop} style={{ color: theme.textPrimary }}>{String(r.hop).padStart(2, ' ')}  {r.ip.padEnd(18)}  {r.time} ms</div>
                ))}
              </div>
              {traceRunning && <div style={{ color: '#F5A623' }}>正在探测...</div>}
            </div>
          </div>
        )}
      </div>

      {/* 带宽测试 */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <h3 style={{ ...sectionTitleStyle, margin: 0 }}>带宽测试</h3>
          <span style={{ color: theme.textTertiary, fontSize: 12 }}>测量网络带宽和抖动</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button onClick={handleBandwidth} style={bwRunning ? runningBtn('结束测速') : normalBtn}>{bwRunning ? '结束测速' : bwDone ? '重新测速' : '开始测速'}</button>
        </div>
        {bwResult && !bwRunning && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div style={{ background: theme.bgInput, borderRadius: 8, padding: 16, textAlign: 'center' }}>
              <div style={{ color: theme.textTertiary, fontSize: 11 }}>下行速率</div>
              <div style={{ color: theme.success, fontSize: 22, fontWeight: 700 }}>{bwResult.down}</div>
              <div style={{ color: theme.textTertiary, fontSize: 11 }}>Mbps</div>
            </div>
            <div style={{ background: theme.bgInput, borderRadius: 8, padding: 16, textAlign: 'center' }}>
              <div style={{ color: theme.textTertiary, fontSize: 11 }}>上行速率</div>
              <div style={{ color: theme.primary, fontSize: 22, fontWeight: 700 }}>{bwResult.up}</div>
              <div style={{ color: theme.textTertiary, fontSize: 11 }}>Mbps</div>
            </div>
            <div style={{ background: theme.bgInput, borderRadius: 8, padding: 16, textAlign: 'center' }}>
              <div style={{ color: theme.textTertiary, fontSize: 11 }}>抖动</div>
              <div style={{ color: bwResult.jitter < 10 ? theme.success : '#F5A623', fontSize: 22, fontWeight: 700 }}>{bwResult.jitter}</div>
              <div style={{ color: theme.textTertiary, fontSize: 11 }}>ms</div>
            </div>
          </div>
        )}
      </div>

      {/* 系统信息 */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={sectionTitleStyle}>系统信息</h3>
        <button onClick={() => { runDiagnostics(); toast.success('诊断完成'); }} disabled={loading} style={{ ...normalBtn, marginBottom: 12, opacity: loading ? 0.7 : 1 }}>{loading ? '诊断中...' : '运行诊断'}</button>
        {diagnosticInfo ? (
          <div style={{ ...cardStyle, padding: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <DiagItem label="网络连接" value={diagnosticInfo.networkStatus === 'connected' ? '正常' : '异常'} good={diagnosticInfo.networkStatus === 'connected'} />
              <DiagItem label="API 服务" value={diagnosticInfo.apiConnectivity ? '正常' : '异常'} good={diagnosticInfo.apiConnectivity} />
              <DiagItem label="SPICE 服务" value={diagnosticInfo.spiceConnectivity ? '正常' : '异常'} good={diagnosticInfo.spiceConnectivity} />
              <DiagItem label="网络延迟" value={`${diagnosticInfo.latency} ms`} good={diagnosticInfo.latency < 50} />
              <DiagItem label="丢包率" value={`${diagnosticInfo.packetLoss}%`} good={diagnosticInfo.packetLoss < 1} />
              <DiagItem label="CPU 使用率" value={`${diagnosticInfo.cpuUsage}%`} good={diagnosticInfo.cpuUsage < 70} />
              <DiagItem label="内存使用率" value={`${diagnosticInfo.memoryUsage}%`} good={diagnosticInfo.memoryUsage < 80} />
              <DiagItem label="客户端版本" value={`v${diagnosticInfo.appVersion}`} good={true} />
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: theme.textTertiary, fontSize: 13, background: theme.bgInput, borderRadius: 8 }}>点击"运行诊断"检查系统状态</div>
        )}
      </div>
    </div>
  );
};

const DiagItem: React.FC<{ label: string; value: string; good: boolean }> = ({ label, value, good }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, borderBottom: `1px solid ${theme.borderLight}` }}>
    <span style={{ color: theme.textSecondary }}>{label}</span>
    <span style={{ color: good ? theme.success : '#F5A623', fontWeight: good ? 400 : 600 }}>{value}</span>
  </div>
);

export default DiagnosticTools;
