// Logotipo Habitaclick (opcion D: llave). "light" = para fondos claros, "dark" = para fondos oscuros.
export function LogoMark({ size = 32, variant = 'light' }: { size?: number; variant?: 'light' | 'dark' }) {
  const main = variant === 'light' ? '#003366' : '#FFFFFF';
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <circle cx="17" cy="32" r="11" fill="none" stroke={main} strokeWidth="8" />
      <rect x="27" y="28.5" width="32" height="7" rx="1.5" fill={main} />
      <rect x="43" y="35.5" width="7" height="10" fill="#2ECC71" />
      <rect x="53" y="35.5" width="6" height="7" fill="#2ECC71" />
    </svg>
  );
}

export default function Logo({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  return (
    <span className={`logo-lockup ${variant === 'dark' ? 'logo-light' : ''}`}>
      <LogoMark size={34} variant={variant} />
      <span className="logo-word">
        Habita<span>click</span>
      </span>
    </span>
  );
}
