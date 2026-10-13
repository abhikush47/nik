import Link from "next/link";

interface WordmarkProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  light?: boolean;
}

export default function Wordmark({ className = "", size = "md", light = false }: WordmarkProps) {
  const sizeClasses = {
    sm: "text-base tracking-wider",
    md: "text-lg sm:text-xl tracking-wider",
    lg: "text-2xl sm:text-3xl tracking-widest",
    xl: "text-3xl sm:text-5xl tracking-widest",
  };

  if (light) {
    return (
      <Link
        href="/"
        className={`inline-flex items-center gap-1.5 font-bold uppercase transition-opacity hover:opacity-90 ${sizeClasses[size]} ${className}`}
        aria-label="NEPALI IN KIIT Homepage"
      >
        <span className="font-extrabold text-white">NEPALI</span>
        <span className="text-[0.65em] font-black text-[#DC143C] px-1 py-0.5 rounded bg-white/10 tracking-normal inline-block align-middle">
          IN
        </span>
        <span className="font-extrabold text-emerald-300">KIIT</span>
      </Link>
    );
  }

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-1.5 font-bold uppercase transition-opacity hover:opacity-90 ${sizeClasses[size]} ${className}`}
      aria-label="NEPALI IN KIIT Homepage"
    >
      <span className="font-extrabold text-[#0B3D2E] tracking-tight">NEPALI</span>
      <span className="text-[0.65em] font-black text-[#DC143C] px-1.5 py-0.5 rounded bg-[#DC143C]/10 tracking-normal inline-block align-middle">
        IN
      </span>
      <span className="font-extrabold text-[#142B4A] tracking-tight">KIIT</span>
    </Link>
  );
}
