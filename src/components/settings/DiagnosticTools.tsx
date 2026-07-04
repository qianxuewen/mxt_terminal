import React from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from '@/components/common/Toast';
import { theme, sectionTitleStyle, cardStyle } from '@/theme';

const DiagnosticTools: React.FC = () => {
  const { diagnosticInfo, runDiagnostics, loading } = useSettingsStore();

  const handleRunDiagnostics = async () => {
    await runDiagnostics();
    toast.success('诊断完成');
  };

  const Divider: React.FC = () => (
    <div style={{ height: 1, background: theme.borderLight, margin: '20px 0' }} />
  );

  return (
    <div style={{ maxWidth: 700 }}>
      <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700, color: theme.textPrimary }}>诊断工具</h2>

      <button
        onClick={handleRunDiagnostics}
        disabled={loading}
        style={{
          padding: '10px 24px', marginBottom: 24,
          background: loading ? theme.primary + '80' : theme.gradientPrimary,
          border: 'none', borderRadius: theme.radius, color: '#fff', fontSize: 14, fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? '诊断中...' : '运行诊断'}
      </button>

      {diagnosticInfo ? (
        <div style={{ ...cardStyle, padding: 24 }}>
          <h3 style={{ ...sectionTitleStyle, marginBottom: 16 }}>诊断结果</h3>

          {/* Network */}
          <div style={{ marginBottom: 16 }}>
            <h4 style={{ margin: '0 0 8px', fontSize: 14, color: theme.textSecondary }}>网络状态</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <DiagItem label="网络连接" value={diagnosticInfo.networkStatus === 'connected' ? '正常' : '异常'} good={diagnosticInfo.networkStatus === 'connected'} />
              <DiagItem label="API 服务" value={diagnosticInfo.apiConnectivity ? '正常' : '异常'} good={diagnosticInfo.apiConnectivity} />
              <DiagItem label="SPICE 服务" value={diagnosticInfo.spiceConnectivity ? '正常' : '异常'} good={diagnosticInfo.spiceConnectivity} />
              <DiagItem label="网络延迟" value={`${diagnosticInfo.latency} ms`} good={diagnosticInfo.latency < 50} />
              <DiagItem label="丢包率" value={`${diagnosticInfo.packetLoss}%`} good={diagnosticInfo.packetLoss < 1} />
            </div>
          </div>

          <Divider />

          {/* System */}
          <div style={{ marginBottom: 16 }}>
            <h4 style={{ margin: '0 0 8px', fontSize: 14, color: theme.textSecondary }}>系统状态</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <DiagItem label="CPU 使用率" value={`${diagnosticInfo.cpuUsage}%`} good={diagnosticInfo.cpuUsage < 70} />
              <DiagItem label="内存使用率" value={`${diagnosticInfo.memoryUsage}%`} good={diagnosticInfo.memoryUsage < 80} />
              <DiagItem label="磁盘空间" value={`${diagnosticInfo.diskSpace} GB`} good={(diagnosticInfo.diskSpace || 0) > 10} />
              <DiagItem label="操作系统" value={diagnosticInfo.osInfo} good={true} />
              <DiagItem label="客户端版本" value={`v${diagnosticInfo.appVersion}`} good={true} />
            </div>
          </div>

          {/* Logs */}
          {diagnosticInfo.logs && diagnosticInfo.logs.length > 0 && (
            <>
              <Divider />
              <div>
                <h4 style={{ margin: '0 0 8px', fontSize: 14, color: theme.textSecondary }}>诊断日志</h4>
                {diagnosticInfo.logs.map((log, idx) => (
                  <div key={idx} style={{
                    padding: '6px 10px', marginBottom: 4, borderRadius: 4, fontSize: 12,
                    background: log.level === 'error' ? 'rgba(255,77,79,0.06)' :
                               log.level === 'warn' ? 'rgba(250,173,20,0.08)' : theme.bgInput,
                    color: log.level === 'error' ? '#ff4d4f' :
                           log.level === 'warn' ? '#F5A623' : theme.textTertiary,
                    fontFamily: 'monospace',
                  }}>
                    [{log.timestamp.slice(11, 19)}] [{log.module}] {log.message}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 60, color: theme.textTertiary, fontSize: 14 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <p>点击"运行诊断"检查系统状态</p>
        </div>
      )}
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
