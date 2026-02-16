"use client";

import ReactStars from "react-stars";

export default function WorkerRatingStars({ rating }) {
  // rating = { average: Number, total: Number } | null

  if (!rating || rating.total === 0) {
    return (
      <p className="text-xs text-gray-500 dark:text-zinc-400">
        ⭐ Not rated yet
      </p>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <ReactStars
        count={5}
        value={rating.average}
        edit={false}
        size={16}
        isHalf={true}
        activeColor="#facc15"
        color="#d1d5db"
      />

      <span className="text-xs text-gray-600 dark:text-zinc-400">
        {rating.average.toFixed(1)} ({rating.total})
      </span>
    </div>
  );
}
