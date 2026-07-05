import React, { useEffect, useState } from 'react';
import type { CloudDesktop, DesktopPowerAction } from '@/types';
import { useDesktopStore } from '@/store/desktopStore';
import { useConnectionStore } from '@/store/connectionStore';
import { useNavigate } from 'react-router-dom';
import DesktopCard from './DesktopCard';
import StatusIndicator from '@/components/common/StatusIndicator';
import { toast } from '@/components/common/Toast';
import { theme, inputStyle, secondaryBtnStyle } from '@/theme';

const DesktopList: React.FC = () => {
  const navigate = useNavigate();
  const {
    desktops,
    loading,
    error,
    filter,
    fetchDesktops,
    powerAction,
    fetchPowerInfo,
  } = useDesktopStore();

  const { connect } = useConnectionStore();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchDesktops();
  }, []);

  const handleConnect = async (desktop: CloudDesktop) => {
    try {
      await connect(desktop.id);
      navigate(`/desktop/${desktop.id}`);
    } catch (err: any) {
      toast.error(err?.message || '连接失败');
    }
  };

  const handlePowerAction = async (desktop: CloudDesktop, action: DesktopPowerAction) => {
    const actionLabels: Record<string, string> = {
      start: '开机',
      stop: '关机',
      restart: '重启',
      suspend: '休眠',
    };

    try {
      await powerAction(desktop.id, action);
      toast.success(`${desktop.name} ${actionLabels[action]}操作已执行`);
    } catch {
      toast.error(`${actionLabels[action]}操作失败`);
    }
  };

  const handleSettings = (desktop: CloudDesktop) => {
    navigate(`/desktop/${desktop.id}/settings`);
  };

  const filteredDesktops = desktops.filter((d) => {
    if (statusFilter === 'all') return true;
    return d.status === statusFilter;
  });

  const containerStyle: React.CSSProperties = {
    padding: '24px 32px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: theme.textPrimary }}>云桌面</h1>
          <p style={{ margin: '4px 0 0', color: theme.textTertiary, fontSize: 14 }}>
            共 {filteredDesktops.length} 台桌面
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '6px 10px', fontSize: 13, width: 100, border: `1px solid ${theme.borderInput}`, borderRadius: 6, color: theme.textPrimary, background: theme.bgInput }}
          >
            <option value="all">全部</option>
            <option value="running">运行中</option>
            <option value="stopped">已关机</option>
            <option value="suspended">已休眠</option>
          </select>

          {/* View toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            style={{
              ...secondaryBtnStyle,
              padding: '6px 10px',
              fontSize: 16,
            }}
          >
            {viewMode === 'grid' ? '≡' : '⊞'}
          </button>

          {/* Refresh */}
          <button
            onClick={() => fetchDesktops()}
            style={{
              padding: '6px 14px',
              background: theme.primaryLight,
              border: `1px solid ${theme.primary}40`,
              borderRadius: 6,
              color: theme.primary,
              fontSize: 13,
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            刷新
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: '12px 16px',
            background: 'rgba(255,77,79,0.06)',
            border: '1px solid rgba(255,77,79,0.15)',
            borderRadius: 8,
            color: '#ff4d4f',
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div
          style={{
            textAlign: 'center',
            padding: 60,
            color: theme.textTertiary,
            fontSize: 14,
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          加载中...
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredDesktops.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: 60,
            color: theme.textTertiary,
            fontSize: 14,
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>🖥</div>
          <p>暂无云桌面</p>
        </div>
      )}

      {/* Desktop Grid/List */}
      {!loading && filteredDesktops.length > 0 && (
        viewMode === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16, overflow: 'auto', flex: 1, paddingBottom: 24, maxWidth: 1200, margin: '0 auto', width: '100%', alignContent: 'start' }}>
            {filteredDesktops.map((desktop) => (
              <DesktopCard key={desktop.id} desktop={desktop} onConnect={handleConnect} onPowerAction={handlePowerAction} onSettings={handleSettings} />
            ))}
          </div>
        ) : (
          <div style={{ overflow: 'auto', flex: 1, paddingBottom: 24 }}>
            {filteredDesktops.map((desktop) => (
              <div
                key={desktop.id}
                onClick={() => desktop.status === 'running' && handleConnect(desktop)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', marginBottom: 4,
                  background: theme.bgCard, borderRadius: 8,
                  cursor: desktop.status === 'running' ? 'pointer' : 'default',
                  border: `1px solid ${theme.border}`,
                  boxShadow: theme.shadowCard,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = theme.bgCardHover; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = theme.bgCard; }}
              >
                <span style={{ fontSize: 24 }}>{desktop.osType === 'windows' ? '🪟' : '🐧'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: theme.textPrimary, fontSize: 14, fontWeight: 500 }}>{desktop.name}</div>
                  <div style={{ color: theme.textTertiary, fontSize: 12, marginTop: 2 }}>{desktop.osName} · {desktop.cpu}vCPU · {desktop.memory}GB · {desktop.ipAddress}:{desktop.spicePort}</div>
                </div>
                <StatusIndicator status={desktop.status} size="small" />
                <div style={{ display: 'flex', gap: 4 }}>
                  {desktop.status === 'running' ? (
                    <button onClick={(e) => { e.stopPropagation(); handleConnect(desktop); }} style={{ padding: '4px 12px', background: theme.gradientPrimary, border: 'none', borderRadius: 4, color: '#fff', fontSize: 12, cursor: 'pointer' }}>连接</button>
                  ) : (
                    <button onClick={(e) => { e.stopPropagation(); handlePowerAction(desktop, 'start'); }} style={{ padding: '4px 12px', background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 4, color: theme.textTertiary, fontSize: 12, cursor: 'pointer' }}>开机</button>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); handleSettings(desktop); }} style={{ padding: '4px 8px', background: 'none', border: 'none', color: theme.textTertiary, fontSize: 14, cursor: 'pointer' }}>⋯</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default DesktopList;
