import { ResourceType } from "./types";

const ALLOWED_DRIVE_HOSTS = [
  "drive.google.com",
  "docs.google.com",
  "sheets.google.com",
  "slides.google.com",
];

/**
 * Validates that a URL is a legitimate HTTPS Google Drive / Docs URL.
 * Rejects javascript:, data:, and unapproved hosts.
 */
export function isValidGoogleDriveUrl(urlStr: string): boolean {
  if (!urlStr || typeof urlStr !== "string") return false;
  try {
    const trimmed = urlStr.trim();
    if (trimmed.startsWith("javascript:") || trimmed.startsWith("data:")) return false;
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") return false;
    const hostname = parsed.hostname.toLowerCase();
    return ALLOWED_DRIVE_HOSTS.some((h) => hostname === h || hostname.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

/**
 * Infers likely ResourceType based on standard Google Drive / Docs URL structures.
 */
export function detectGoogleDriveType(urlStr: string): ResourceType {
  if (!urlStr) return "Google Drive Folder";
  const lower = urlStr.toLowerCase();

  if (lower.includes("/folders/") || lower.includes("drive.google.com/drive/u/")) {
    return "Google Drive Folder";
  }
  if (lower.includes("/document/") || lower.includes("docs.google.com/document")) {
    return "Google Docs";
  }
  if (lower.includes("/spreadsheets/") || lower.includes("docs.google.com/spreadsheets") || lower.includes("sheets.google.com")) {
    return "Google Sheets";
  }
  if (lower.includes("/presentation/") || lower.includes("docs.google.com/presentation") || lower.includes("slides.google.com")) {
    return "Google Slides";
  }
  if (lower.includes(".pdf") || lower.includes("type=pdf")) {
    return "PDF";
  }
  if (lower.includes(".mp4") || lower.includes(".mov") || lower.includes("video")) {
    return "Video";
  }

  return "Google Drive Folder";
}
