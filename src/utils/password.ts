export const MIN_LEN = 8;

export function checkPassword(pwd: string) {
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /\d/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
  const hasMinLen = pwd.length >= MIN_LEN;

  const scoreParts = [hasUpper, hasLower, hasNumber, hasSpecial, hasMinLen];
  const score = scoreParts.filter(Boolean).length; // 0..5

  return { hasUpper, hasLower, hasNumber, hasSpecial, hasMinLen, score };
}

export function strengthPercent(score: number) {
  return Math.min(100, Math.max(0, Math.round((score / 5) * 100)));
}

export function strengthColor(score: number) {
  const hue = Math.round((score / 5) * 120); // 0 (vermelho) → 120 (verde)
  return `hsl(${hue} 90% 45%)`;
}
src/components/PasswordStrength.tsx

tsx
Copiar
Editar
import React from 'react';
import { checkPassword, strengthColor, strengthPercent, MIN_LEN } from '../utils/password';

type Props = {
  password: string;
  onValidChange?: (isValid: boolean) => void;
};

const PasswordStrength: React.FC<Props> = ({ password, onValidChange }) => {
  const { hasUpper, hasLower, hasNumber, hasSpecial, hasMinLen, score } = checkPassword(password);
  const percent = strengthPercent(score);
  const color = strengthColor(score);
  const isValid = hasUpper && hasLower && hasNumber && hasSpecial && hasMinLen;

  React.useEffect(() => {
    onValidChange?.(isValid);
  }, [isValid, onValidChange]);

  const Item = ({ ok, children }: { ok: boolean; children: React.ReactNode }) => (
    <li className={`flex items-center gap-2 ${ok ? 'text-green-400' : 'text-red-400'}`}>
      <span className={`text-[10px] leading-none px-1 rounded ${ok ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
        {ok ? '✓' : '•'}
      </span>
      <span className="text-[12px]">{children}</span>
    </li>
  );

  return (
    <div className="mt-2">
      <div className="h-1.5 w-full rounded-full bg-gray-700 overflow-hidden">
        <div className="h-full transition-all duration-300" style={{ width: `${percent}%`, backgroundColor: color }} />
      </div>

      <ul className="mt-2 grid grid-cols-2 gap-y-1 gap-x-3">
        <Item ok={hasUpper}>1 letra maiúscula (A–Z)</Item>
        <Item ok={hasLower}>1 letra minúscula (a–z)</Item>
        <Item ok={hasNumber}>1 número (0–9)</Item>
        <Item ok={hasSpecial}>1 caractere especial</Item>
        <Item ok={hasMinLen}>mínimo de {MIN_LEN} caracteres</Item>
      </ul>
    </div>
  );
};

export default PasswordStrength;
