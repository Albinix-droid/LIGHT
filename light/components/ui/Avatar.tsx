// components/ui/Avatar.tsx
// Photo de profil, ou initiales sur un fond calme dérivé du nom (toujours la même couleur pour une personne)

const TONES = [
  "bg-[#e8eefc] text-[#1a43b8] dark:bg-[#1a2a52] dark:text-[#a9c1ff]",
  "bg-[#f7f0dc] text-[#8a6418] dark:bg-[#3a2f14] dark:text-[#ecd08a]",
  "bg-[#e6f5ee] text-[#0b7a54] dark:bg-[#123a2e] dark:text-[#7fe3bd]",
  "bg-[#efeafd] text-[#5b3fc4] dark:bg-[#2a2150] dark:text-[#c4b5fd]",
  "bg-[#fdecef] text-[#b0324f] dark:bg-[#43172a] dark:text-[#f9a8bd]",
  "bg-[#e7f4f8] text-[#14708c] dark:bg-[#123744] dark:text-[#8fd6ec]",
];

function toneFor(seed: string) {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return TONES[Math.abs(hash) % TONES.length];
}

const SIZES = {
  sm: "size-8 text-[11px] rounded-lg",
  md: "size-10 text-xs rounded-xl",
  lg: "size-12 text-sm rounded-2xl",
} as const;

export default function Avatar({
  name,
  url,
  size = "md",
  className = "",
}: {
  name: string;
  url?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const initials = name.split(/\s+/).filter(Boolean).map((part) => part[0]).join("").toUpperCase().slice(0, 2) || "?";
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" className={`${SIZES[size]} shrink-0 object-cover ${className}`} />;
  }
  return (
    <span aria-hidden="true" className={`${SIZES[size]} ${toneFor(name)} inline-flex shrink-0 items-center justify-center font-display font-semibold ${className}`}>
      {initials}
    </span>
  );
}
