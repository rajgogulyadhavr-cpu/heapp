export default function GlassCard({ children, className = '', style = {}, ...props }) {
  return (
    <div className={`glass-card p-6 ${className}`} style={style} {...props}>
      {children}
    </div>
  )
}
