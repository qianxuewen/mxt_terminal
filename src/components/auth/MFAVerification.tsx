import React, { useState, useRef, useEffect } from 'react';
import { theme } from '@/theme';

interface MFAVerificationProps {
  sessionId: string;
  onVerify: (code: string) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  error?: string | null;
}

const MFAVerification: React.FC<MFAVerificationProps> = ({
  sessionId,
  onVerify,
  onCancel,
  loading = false,
  error,
}) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const fullCode = code.join('');
    if (fullCode.length === 6) {
      await onVerify(fullCode);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
      <h3 style={{ color: theme.textPrimary, fontSize: 20, marginBottom: 8 }}>二次验证</h3>
      <p style={{ color: theme.textTertiary, fontSize: 14, marginBottom: 24 }}>
        请输入发送至您手机的 6 位验证码
      </p>
      <p style={{ color: theme.textTertiary, fontSize: 12, marginBottom: 20 }}>
        会话 ID: {sessionId.slice(0, 8)}...
      </p>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            style={{
              width: 48,
              height: 56,
              textAlign: 'center',
              fontSize: 24,
              fontWeight: 600,
              background: theme.bgInput,
              border: `2px solid ${digit ? theme.primary : theme.borderInput}`,
              borderRadius: 10,
              color: theme.textPrimary,
              outline: 'none',
            }}
          />
        ))}
      </div>

      {error && (
        <div style={{ color: '#ff4d4f', fontSize: 13, marginBottom: 12 }}>{error}</div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || code.join('').length !== 6}
        style={{
          width: '100%',
          padding: '12px',
          background: code.join('').length === 6
            ? theme.gradientPrimary
            : theme.bgInput,
          border: 'none',
          borderRadius: 8,
          color: code.join('').length === 6 ? '#fff' : theme.textDisabled,
          fontSize: 16,
          fontWeight: 600,
          cursor: loading || code.join('').length !== 6 ? 'not-allowed' : 'pointer',
          marginBottom: 12,
        }}
      >
        {loading ? '验证中...' : '确认'}
      </button>

      {onCancel && (
        <button
          onClick={onCancel}
          style={{
            background: 'none',
            border: 'none',
            color: theme.textTertiary,
            fontSize: 14,
            cursor: 'pointer',
            padding: '8px',
          }}
        >
          返回登录
        </button>
      )}

      <div style={{ marginTop: 16, color: theme.textTertiary, fontSize: 12 }}>
        未收到验证码？<span style={{ color: theme.primary, cursor: 'pointer' }}>重新发送</span>
      </div>
    </div>
  );
};

export default MFAVerification;
