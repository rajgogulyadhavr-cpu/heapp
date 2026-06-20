export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-5">
      <div className="relative">
        <div className="spinner" />
        <div
          className="absolute inset-0 flex items-center justify-center text-sm"
          style={{ color: 'var(--color-accent)' }}
        >
        </div>
      </div>
      <div className="text-center">
        <p
          className="text-sm font-medium animate-neon-pulse"
          style={{ color: 'var(--color-accent)', fontFamily: 'Poppins, sans-serif' }}
        >
          {text}
        </p>
        <p
          className="text-xs mt-1"
          style={{ color: 'var(--color-text-secondary)', fontFamily: 'Poppins, sans-serif' }}
        >
          Please wait...
        </p>
      </div>
    </div>
  )
}
