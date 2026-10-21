"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Mail, Lock } from "lucide-react";
import InstagramIcon from "./icons/InstagramIcon";
import Wordmark from "./Wordmark";

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  // Hide public footer on admin CMS routes
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-[#0D1C30] text-gray-300 border-t border-[#142B4A]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand & Identity Column */}
          <div className="lg:col-span-2 space-y-4">
            <Wordmark size="lg" light />
            <p className="text-gray-300 text-sm leading-relaxed max-w-sm pt-2">
              The living digital home and student community for every Nepali student at KIIT University, Bhubaneswar, Odisha.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-300 bg-emerald-950/60 border border-emerald-800/40 px-3 py-1.5 rounded-full">
                <span>Two Nations. One Community.</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 italic">
              “Every Nepali in KIIT belongs here.”
            </p>
          </div>

          {/* Explore Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Community</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About NIK
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-white transition-colors">
                  Our Community
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-white transition-colors">
                  Events & Gatherings
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-white transition-colors">
                  Community Gallery
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-white transition-colors">
                  Resources Hub
                </Link>
              </li>
            </ul>
          </div>

          {/* Get Involved Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Connect</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/announcements" className="hover:text-white transition-colors">
                  Announcements
                </Link>
              </li>
              <li>
                <Link href="/join" className="hover:text-white transition-colors">
                  Join NIK
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors mt-2">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>Admin Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Social & Contact */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Connect With Us</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2.5">
                <InstagramIcon className="w-4 h-4 text-[#DC143C] flex-shrink-0 mt-0.5" />
                <a
                  href="https://www.instagram.com/nepaliinkiit/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors underline decoration-gray-600 underline-offset-4"
                >
                  @nepaliinkiit
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-gray-300">contact@nepaliinkiit.org</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-gray-300 leading-tight">
                  KIIT University Campus, Bhubaneswar, Odisha, India
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© {currentYear} NEPALI IN KIIT. Student-led community initiative.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-gray-700">•</span>
            <span className="inline-flex items-center gap-1 text-gray-400">
              Built with care for all Nepali students in KIIT
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
