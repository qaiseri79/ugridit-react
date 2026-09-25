export default function DateStr({ ts }: { ts: number | undefined | null }) {
  const s = ts ? new Date(ts).toDateString() : '-'
  return <>{s}</>
}