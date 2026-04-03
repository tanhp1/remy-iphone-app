export default function SkeletonCard({ height = 'h-32', className = '' }) {
  return (
    <div className={`${height} ${className} bg-s2 rounded-2xl overflow-hidden relative`}>
      <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-s2 via-s3 to-s2" />
    </div>
  );
}
