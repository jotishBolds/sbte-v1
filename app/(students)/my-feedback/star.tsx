import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  disabled?: boolean;
}

export const StarRating = ({
  rating,
  onRatingChange,
  disabled,
}: StarRatingProps) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          className={`
            transition-all duration-100 
            ${
              disabled
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:scale-110"
            }
          `}
          onMouseEnter={() => !disabled && setHoverRating(star)}
          onMouseLeave={() => !disabled && setHoverRating(0)}
          onClick={() => !disabled && onRatingChange(star)}
        >
          <Star
            className={`w-6 h-6 transition-colors duration-200 ${
              star <= (hoverRating || rating)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-transparent text-gray-300"
            }`}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-600 whitespace-nowrap">
        {rating} of 5
      </span>
    </div>
  );
};
