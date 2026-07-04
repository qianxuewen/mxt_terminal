/**
 * TP-LINK 蓝白主题 - 参考 TP-LINK 客户端设计风格
 *
 * 配色灵感：
 *   - 主色: #1871FF TP-LINK 品牌蓝
 *   - 背景: 白色/浅灰页面，深蓝侧边栏（TP-LINK 路由器管理界面风格）
 *   - 干净、专业的企业级界面
 */

export const theme = {
  // ─── 品牌色 ───
  primary: '#1871FF',
  primaryHover: '#0055CC',
  primaryActive: '#004099',
  primaryLight: '#E8F0FE',   // 浅蓝背景（选中态/悬停态）
  primaryBg: 'rgba(24, 113, 255, 0.08)',

  // ─── 语义色 ───
  success: '#19BE6B',
  warning: '#F5A623',
  danger: '#FF4D4F',
  info: '#1871FF',

  // ─── 背景色 ───
  bgPage: '#F0F2F5',           // 页面主背景（浅灰）
  bgCard: '#FFFFFF',           // 卡片背景（白）
  bgCardHover: '#F5F7FA',      // 卡片悬停
  bgSidebar: '#0E1B4D',       // 侧边栏深蓝（TP-LINK 风格）
  bgSidebarHover: 'rgba(255,255,255,0.06)',
  bgSidebarActive: 'rgba(255,255,255,0.1)',
  bgInput: '#F5F7FA',          // 输入框背景
  bgInputDisabled: '#EBEDF0',
  bgModal: '#FFFFFF',
  bgOverlay: 'rgba(0, 0, 0, 0.45)',
  bgToast: '#FFFFFF',

  // ─── 文字色 ───
  textPrimary: '#1A2332',       // 主文字（近黑）
  textSecondary: '#5A6A7A',    // 次要文字
  textTertiary: '#8C9DAD',     // 辅助文字
  textDisabled: '#C0C8D4',
  textWhite: '#FFFFFF',
  textOnPrimary: '#FFFFFF',
  textLink: '#1871FF',

  // ─── 边框色 ───
  border: '#E8ECF0',
  borderLight: '#F0F2F5',
  borderInput: '#D9DEE4',
  borderInputFocus: '#1871FF',

  // ─── 阴影 ───
  shadow: '0 2px 8px rgba(0,0,0,0.06)',
  shadowLg: '0 8px 24px rgba(0,0,0,0.08)',
  shadowCard: '0 2px 12px rgba(0,0,0,0.04)',
  shadowModal: '0 20px 60px rgba(0,0,0,0.15)',

  // ─── 圆角 ───
  radius: 8,
  radiusLg: 12,
  radiusRound: 20,

  // ─── 渐变 ───
  gradientPrimary: 'linear-gradient(135deg, #1871FF 0%, #0055CC 100%)',
  gradientSidebar: 'linear-gradient(180deg, #0E1B4D 0%, #1A2D6D 100%)',
  gradientLogo: 'linear-gradient(135deg, #1871FF, #4D8FFF)',
} as const;

export type Theme = typeof theme;

/** 便捷工具：生成居中卡片样式 */
export const cardStyle: React.CSSProperties = {
  background: theme.bgCard,
  borderRadius: theme.radiusLg,
  border: `1px solid ${theme.border}`,
  boxShadow: theme.shadowCard,
};

/** 便捷工具：输入框样式 */
export const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  background: theme.bgInput,
  border: `1px solid ${theme.borderInput}`,
  borderRadius: theme.radius,
  color: theme.textPrimary,
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.2s',
};

/** 便捷工具：标签样式 */
export const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  color: theme.textSecondary,
  marginBottom: 6,
};

/** 便捷工具：主要按钮样式 */
export const primaryBtnStyle: React.CSSProperties = {
  padding: '10px 32px',
  background: theme.gradientPrimary,
  border: 'none',
  borderRadius: theme.radius,
  color: theme.textOnPrimary,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s',
};

/** 便捷工具：次要按钮样式 */
export const secondaryBtnStyle: React.CSSProperties = {
  padding: '10px 24px',
  background: theme.bgCard,
  border: `1px solid ${theme.border}`,
  borderRadius: theme.radius,
  color: theme.textSecondary,
  fontSize: 14,
  cursor: 'pointer',
  transition: 'all 0.2s',
};

/** 便捷工具：区块标题样式 */
export const sectionTitleStyle: React.CSSProperties = {
  margin: '0 0 12px',
  fontSize: 15,
  fontWeight: 600,
  color: theme.textPrimary,
};

/** 便捷工具：toggle 按钮样式（开/关选择器） */
export const toggleBtnStyle = (active: boolean): React.CSSProperties => ({
  flex: 1,
  padding: '8px 12px',
  borderRadius: theme.radius,
  cursor: 'pointer',
  fontSize: 13,
  background: active ? theme.primaryLight : theme.bgCard,
  border: `1px solid ${active ? theme.primary : theme.border}`,
  color: active ? theme.primary : theme.textTertiary,
  transition: 'all 0.2s',
});

/** 便捷工具：详情行样式 */
export const detailRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 0',
  fontSize: 14,
  borderBottom: `1px solid ${theme.borderLight}`,
};
