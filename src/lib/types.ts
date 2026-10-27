export type UserRole = "admin" | "editor" | "superadmin";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  id: string;
  community_name: string;
  short_name: string;
  tagline: string;
  core_message: string;
  hero_headline: string;
  hero_description: string;
  footer_text: string;
  contact_email: string;
  contact_phone: string;
  contact_location: string;
  instagram_url: string;
  marquee_ticker_enabled: boolean;
  marquee_ticker_speed: number;
  maintenance_mode: boolean;
  meta_title: string;
  meta_description: string;
  updated_at: string;
}

export type AnnouncementCategory = "General" | "Events" | "Important" | "Community Updates";
export type AnnouncementPriority = "low" | "normal" | "high" | "urgent";
export type PublicationStatus = "published" | "draft" | "archived";

export interface Announcement {
  id: string;
  title: string;
  slug: string;
  short_message: string;
  content?: string | null;
  category: AnnouncementCategory;
  cover_image?: string | null;
  destination_url?: string | null;
  start_time: string;
  expiry_time?: string | null;
  priority: AnnouncementPriority;
  marquee_enabled: boolean;
  status: PublicationStatus;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export type EventCategory = 
  | "Cultural Celebrations" 
  | "Student Gathering" 
  | "Sports & Tournaments" 
  | "Academic & Workshops" 
  | "Community Meetup";

export type EventStatus = "published" | "draft" | "past" | "cancelled";
export type RegistrationStatus = "open" | "closed" | "invite_only" | "none";

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  cover_image: string;
  poster_image?: string | null;
  start_date: string;
  end_date?: string | null;
  venue: string;
  category: EventCategory;
  registration_url?: string | null;
  registration_deadline?: string | null;
  registration_status: RegistrationStatus;
  featured: boolean;
  status: EventStatus;
  seo_title?: string | null;
  seo_description?: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface GalleryCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  display_order: number;
  created_at: string;
}

export interface GalleryImage {
  id: string;
  title: string;
  alt_text: string;
  category_slug: string;
  event_id?: string | null;
  image_url: string;
  photographer_credit?: string | null;
  status: PublicationStatus;
  featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CommunityProfile {
  id: string;
  name: string;
  role: string;
  bio: string;
  image_url?: string | null;
  display_order: number;
  is_published: boolean;
  social_link?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PageContent {
  key: string;
  title: string;
  subtitle?: string | null;
  content: string;
  metadata_json?: Record<string, unknown> | null;
  updated_at: string;
}

export type ContactStatus = "new" | "read" | "in_progress" | "resolved" | "archived";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
  private_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export type JoinRequestStatus = "new" | "reviewed" | "contacted" | "resolved" | "archived";

export interface JoinRequest {
  id: string;
  full_name: string;
  email: string;
  course?: string | null;
  year_of_study?: string | null;
  interests?: string | null;
  why_connect?: string | null;
  status: JoinRequestStatus;
  private_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminActivityLog {
  id: string;
  admin_email: string;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  details?: string | null;
  ip_address?: string | null;
  created_at: string;
}

export interface DashboardMetrics {
  totalEvents: number;
  publishedEvents: number;
  upcomingEvents: number;
  totalGalleryImages: number;
  publishedGalleryImages: number;
  activeAnnouncements: number;
  totalAnnouncements?: number;
  unreadMessages: number;
  pendingJoinRequests: number;
  totalResources?: number;
  publishedResources?: number;
}

export type ResourceType =
  | "Google Drive Folder"
  | "Google Docs"
  | "Google Sheets"
  | "Google Slides"
  | "PDF"
  | "Video"
  | "Other";

export interface ResourceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  display_order: number;
  created_at: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  description?: string | null;
  drive_url: string;
  category: string;
  resource_type: ResourceType;
  cover_image_url?: string | null;
  tags?: string[] | null;
  related_event?: string | null;
  event_date?: string | null;
  status: PublicationStatus;
  display_order: number;
  featured: boolean;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

