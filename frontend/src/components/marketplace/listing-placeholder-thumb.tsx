export function ListingPlaceholderThumb({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center bg-card ${className ?? ""}`}>
      <svg width="48" height="48" viewBox="0 0 48 48" className="opacity-40">
        <ellipse cx="24" cy="28" rx="14" ry="16" fill="hsl(var(--egg))" stroke="hsl(var(--foreground))" strokeWidth="2.5" />
      </svg>
    </div>
  );
}