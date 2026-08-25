export default function FeedLoading() {
  return (
    <div className="space-y-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="aurora-skel h-24 bg-surface rounded-lg" />
      ))}
    </div>
  )
}
