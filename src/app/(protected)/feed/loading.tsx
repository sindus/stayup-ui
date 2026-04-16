export default function FeedLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-24 bg-muted rounded-lg" />
      ))}
    </div>
  )
}
