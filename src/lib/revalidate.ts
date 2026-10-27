import { revalidatePath } from "next/cache";

/**
 * Purges Next.js caches across all public routes and the root layout
 * so any modifications made in the admin panel reflect on the website in real-time.
 */
export function revalidateWebsite() {
  try {
    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/resources");
    revalidatePath("/announcements");
    revalidatePath("/events");
    revalidatePath("/community");
    revalidatePath("/about");
    revalidatePath("/contact");
  } catch (err) {
    // Non-critical if called outside active request context
    console.warn("revalidateWebsite notice:", err);
  }
}
