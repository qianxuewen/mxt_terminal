import React, { useEffect, useState } from 'react';
import type { CloudDesktop, DesktopPowerAction } from '@/types';
import { useDesktopStore } from '@/store/desktopStore';
import { useConnectionStore } from '@/store/connectionStore';
import { useNavigate } from 'react-router-dom';
import DesktopCard from './DesktopCard';
import StatusIndicator from '@/components/common/StatusIndicator';
import { toast } from '@/components/common/Toast';

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
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#fff' }}>云桌面</h1>
          <p style={{ margin: '4px 0 0', color: '#888', fontSize: 14 }}>
            共 {filteredDesktops.length} 台桌面
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Status filter */}
          {['all', 'running', 'stopped', 'suspended'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '6px 14px',
                background: statusFilter === s ? 'rgba(74,108,247,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${statusFilter === s ? 'rgba(74,108,247,0.4)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 6,
                color: statusFilter === s ? '#4a6cf7' : '#999',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {s === 'all' ? '全部' : s === 'running' ? '运行中' : s === 'stopped' ? '已关机' : '已休眠'}
            </button>
          ))}

          {/* View toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            style={{
              padding: '6px 10px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 6,
              color: '#999',
              cursor: 'pointer',
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
              background: 'rgba(74,108,247,0.15)',
              border: '1px solid rgba(74,108,247,0.3)',
              borderRadius: 6,
              color: '#4a6cf7',
              fontSize: 13,
              cursor: 'pointer',
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
            background: 'rgba(255,77,79,0.1)',
            border: '1px solid rgba(255,77,79,0.2)',
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
            color: '#888',
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
            color: '#888',
            fontSize: 14,
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>🖥</div>
          <p>暂无云桌面</p>
        </div>
      )}

      {/* Desktop Grid */}
      {!loading && filteredDesktops.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 16,
            overflow: 'auto',
            flex: 1,
            paddingBottom: 24,
          }}
        >
          {filteredDesktops.map((desktop) => (
            <DesktopCard
              key={desktop.id}
              desktop={desktop}
              onConnect={handleConnect}
              onPowerAction={handlePowerAction}
              onSettings={handleSettings}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DesktopList;
