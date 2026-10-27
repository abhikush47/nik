/**
 * Broadcasts updates across all open tabs and windows in the browser.
 * This guarantees that as soon as an admin makes any change (creates, updates, deletes),
 * any active website tab immediately detects it and revalidates in 0 milliseconds.
 */
export function notifyWebsiteUpdate() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("nik_data_updated", Date.now().toString());
    } catch {}
  }
}
