// components/ui/Stars.tsx
// Note de 1 à 5 en étoiles dorées (lecture seule)

import { Star } from "lucide-react";

export default function Stars({ rating, size = 14, className = "" }: { rating: number; size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${rating} sur 5`} role="img">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          style={{ width: size, height: size }}
          className={n <= rating ? "fill-gold-bright text-gold-bright" : "text-line-strong"}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}
