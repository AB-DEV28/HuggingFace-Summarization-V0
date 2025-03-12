export function Container({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`container mx-auto px-4 py-8 max-w-4xl ${className}`}>
      {children}
    </div>
  );
}
