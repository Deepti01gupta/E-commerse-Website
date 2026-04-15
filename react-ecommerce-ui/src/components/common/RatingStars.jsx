export default function RatingStars({ rating }) {
  return (
    <div className="flex items-center gap-1 text-sm">
      <span className="text-amber-500">{"★".repeat(Math.floor(rating))}</span>
      <span className="text-slate-400">{"★".repeat(5 - Math.floor(rating))}</span>
      <span className="ml-1 text-slate-500 dark:text-slate-400">{rating.toFixed(1)}</span>
    </div>
  );
}
