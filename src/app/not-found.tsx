import Link from "next/link";
import { Compass, Home, Calendar } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 text-center">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#0B3D2E] flex items-center justify-center mx-auto shadow-xs border border-emerald-100">
          <Compass className="w-8 h-8 stroke-[1.5]" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#DC143C]">
            404 — Page Not Found
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-display">
            Lost on campus?
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
            The page or event you are looking for has been moved, archived, or does not exist.
          </p>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0B3D2E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#07261D] transition-all shadow-xs"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>

          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider hover:bg-gray-200 transition-all"
          >
            <Calendar className="w-4 h-4" />
            <span>Browse Events</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
