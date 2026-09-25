export default function Symbol({ value, className = '' }: { value: string; className?: string }) {
  return <div className={`symbol ${className}`}>{value}</div>
}