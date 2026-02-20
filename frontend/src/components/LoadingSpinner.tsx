export function LoadingSpinner({ size = 'md', label }: { size?: 'sm' | 'md' | 'lg'; label?: string }) {
  const sizeMap = { sm: 16, md: 28, lg: 44 };
  const px = sizeMap[size];
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <svg
        width={px}
        height={px}
        viewBox="0 0 32 32"
        fill="none"
        style={{ animation: 'spin 0.8s linear infinite' }}
      >
        <circle cx="16" cy="16" r="12" stroke="hsl(var(--border))" strokeWidth="3" />
        <path
          d="M16 4 A12 12 0 0 1 28 16"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  );
}
