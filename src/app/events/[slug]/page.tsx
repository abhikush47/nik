import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import { getEventBySlug } from "@/lib/db";
import EventPosterSection from "@/components/EventPosterSection";

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return {
      title: "Event Not Found",
    };
  }

  return {
    title: `${event.title} — Events`,
    description: event.summary,
    openGraph: {
      title: event.title,
      description: event.summary,
      images: [event.cover_image],
    },
  };
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const startDate = new Date(event.start_date);
  const formattedDate = startDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = startDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isUpcoming = new Date(event.start_date) >= new Date();
  const deadlinePassed = event.registration_deadline
    ? new Date(event.registration_deadline) < new Date()
    : false;
  const isRegistrationActive =
    event.registration_status === "open" && isUpcoming && !deadlinePassed;

  let formattedDeadline: string | null = null;
  if (event.registration_deadline) {
    const d = new Date(event.registration_deadline);
    formattedDeadline = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const timeStr = d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    if (timeStr !== "12:00 AM") {
      formattedDeadline += ` at ${timeStr}`;
    }
  }

  return (
    <article className="pb-24">
      {/* Top Breadcrumb Header */}
      <div className="bg-gray-50 border-b border-gray-200/80 py-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#0B3D2E] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Events</span>
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 space-y-10">
        {/* Event Header Information */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-[#0B3D2E]">
              {event.category}
            </span>
            {isRegistrationActive && (
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-green-100 text-green-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                <span>Registration Open</span>
              </span>
            )}
            {deadlinePassed && isUpcoming && (
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                Registration Closed
              </span>
            )}
            {!isUpcoming && (
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                Past Event
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 font-display tracking-tight leading-tight">
            {event.title}
          </h1>

          <p className="text-base sm:text-lg text-gray-700 leading-relaxed max-w-3xl">
            {event.summary}
          </p>
        </div>

        {/* Hero Cover Image */}
        <div className="relative h-72 sm:h-96 lg:h-[480px] rounded-3xl overflow-hidden shadow-md bg-gray-100 border border-gray-200">
          <Image
            src={event.cover_image}
            alt={event.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1200px) 100vw, 1200px"
          />
        </div>

        {/* Event Meta Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-6 sm:p-8 rounded-2xl border border-gray-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[#DC143C] flex-shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Date & Day</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{formattedDate}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[#0B3D2E] flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Starting Time</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{formattedTime}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-blue-600 flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Venue</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{event.venue}</p>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Detailed Description */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 font-display">About This Event</h2>
            <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed space-y-4 whitespace-pre-line text-sm sm:text-base">
              {event.description}
            </div>

            {/* Official Event Poster Section */}
            {event.poster_image && (
              <EventPosterSection
                posterUrl={event.poster_image}
                eventTitle={event.title}
              />
            )}
          </div>

          {/* Action Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-5">
              <h3 className="text-base font-bold text-gray-900">Participation Status</h3>

              {isRegistrationActive ? (
                <div className="space-y-4">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Registration is free for all Nepali students at KIIT. Reserve your spot to assist our food and logistics committee.
                  </p>
                  {formattedDeadline ? (
                    <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-100 flex items-center justify-between text-xs">
                      <span className="text-gray-600 font-medium">Registration Deadline:</span>
                      <span className="font-bold text-[#DC143C]">{formattedDeadline}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No deadline specified — open until capacity</p>
                  )}
                  <Link
                    href={event.registration_url || "/join"}
                    className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#0B3D2E] hover:bg-[#07261D] text-white font-bold text-sm transition-all shadow-sm active:scale-95"
                  >
                    <span>Register for Event</span>
                    <ArrowUpRight className="w-4 h-4 text-emerald-300" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {!isUpcoming
                      ? "This event has already concluded. Photographs are archived in the gallery."
                      : deadlinePassed
                      ? `Registration is closed. The deadline passed on ${formattedDeadline}.`
                      : "Registrations are currently closed or by direct coordinator invitation."}
                  </p>
                  <Link
                    href="/gallery"
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-all"
                  >
                    <span>Browse Event Photos</span>
                  </Link>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100">
                <Link
                  href="/contact"
                  className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
                >
                  <span>Have questions regarding this event? Contact us →</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
