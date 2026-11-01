// Logotipo Habitaclick (opcion D: llave). "light" = para fondos claros, "dark" = para fondos oscuros.
// Animacion: al cargar, la llave entra y los dientes aparecen; al pasar el cursor, la llave gira como al abrir una puerta.
export function LogoMark({ size = 32, variant = 'light' }: { size?: number; variant?: 'light' | 'dark' }) {
  const main = variant === 'light' ? '#003366' : '#FFFFFF';
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" className="logo-svg">
      <g className="logo-key">
        <circle cx="17" cy="32" r="11" fill="none" stroke={main} strokeWidth="8" />
        <rect x="27" y="28.5" width="32" height="7" rx="1.5" fill={main} />
        <rect className="logo-tooth logo-tooth-1" x="43" y="35.5" width="7" height="10" fill="#2ECC71" />
        <rect className="logo-tooth logo-tooth-2" x="53" y="35.5" width="6" height="7" fill="#2ECC71" />
      </g>
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
