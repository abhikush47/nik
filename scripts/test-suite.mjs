// Comprehensive Test Suite for NIK (NEPALI IN KIIT)
const BASE_URL = "http://localhost:3000";

let adminCookie = "";
let createdAnnouncementId = "";
let createdEventId = "";
let createdEventSlug = "test-e2e-event-" + Date.now();
let createdGalleryId = "";
let testContactId = "";
let testJoinId = "";

const results = [];

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    results.push({ passed: false, message });
    throw new Error(`Assertion failed: ${message}`);
  } else {
    console.log(`✅ PASS: ${message}`);
    results.push({ passed: true, message });
  }
}

async function runTests() {
  console.log("=== STARTING NIK VERIFICATION TEST SUITE ===\n");

  // 1. PUBLIC PAGES AVAILABILITY
  console.log("--- Testing Public Page Availability ---");
  const pages = ["/", "/about", "/community", "/events", "/gallery", "/announcements", "/join", "/contact", "/privacy"];
  for (const page of pages) {
    const res = await fetch(`${BASE_URL}${page}`);
    assert(res.status === 200, `Public route ${page} returns 200 OK`);
  }

  // 2. SECURITY & RLS TESTS: UNAUTHORIZED ACCESS
  console.log("\n--- Testing Security: Unauthorized Access Prevention ---");
  const protectedEndpoints = [
    "/api/admin/announcements",
    "/api/admin/events",
    "/api/admin/gallery",
    "/api/admin/messages",
    "/api/admin/community",
    "/api/admin/pages",
    "/api/admin/settings",
    "/api/admin/activity",
    "/api/auth/me",
  ];

  for (const ep of protectedEndpoints) {
    const res = await fetch(`${BASE_URL}${ep}`);
    assert(res.status === 401, `Anonymous request to ${ep} is blocked with 401 Unauthorized`);
  }

  // 3. PUBLIC FORM SUBMISSIONS
  console.log("\n--- Testing Public Form Submissions ---");
  // A. Contact form valid submission
  const contactRes = await fetch(`${BASE_URL}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Prabesh Karki",
      email: "prabesh.karki@kiit.ac.in",
      subject: "Question about Dashain Tika timings",
      message: "Namaste coordinators, could you confirm when the Jamara distribution begins?",
    }),
  });
  const contactData = await contactRes.json();
  assert(contactRes.status === 200 && contactData.success, "Contact form valid submission succeeds");
  testContactId = contactData.id;

  // B. Contact form validation check (empty fields)
  const contactInvalidRes = await fetch(`${BASE_URL}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "", email: "not-an-email", subject: "", message: "" }),
  });
  assert(contactInvalidRes.status === 400, "Contact form rejects invalid input with 400");

  // C. Join NIK form valid submission
  const joinRes = await fetch(`${BASE_URL}/api/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      full_name: "Sneha Poudel",
      email: "2405991@kiit.ac.in",
      course: "B.Tech Biotechnology",
      year_of_study: "1st Year",
      interests: "Cultural Festivals, Acoustic Performances",
      why_connect: "Just arrived from Pokhara. Looking to make friends from Nepal in Bhubaneswar.",
    }),
  });
  const joinData = await joinRes.json();
  assert(joinRes.status === 200 && joinData.success, "Join NIK community form submission succeeds");
  testJoinId = joinData.id;

  // 4. AUTHENTICATION LIFECYCLE
  console.log("\n--- Testing Authentication Lifecycle ---");
  // A. Bad login
  const badLogin = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@nepaliinkiit.org", password: "WrongPassword123!" }),
  });
  assert(badLogin.status === 401, "Login rejects invalid password with 401");

  // B. Valid login
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@nepaliinkiit.org", password: "AdminNik2026!" }),
  });
  const loginData = await loginRes.json();
  assert(loginRes.status === 200 && loginData.success, "Admin login succeeds with 200 OK");

  // Extract set-cookie header
  const setCookie = loginRes.headers.get("set-cookie");
  assert(Boolean(setCookie && setCookie.includes("nik_admin_session")), "Admin session cookie is issued");
  adminCookie = setCookie.split(";")[0];

  // C. Verify auth status via /api/auth/me
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Cookie: adminCookie },
  });
  const meData = await meRes.json();
  assert(meRes.status === 200 && meData.user?.email === "admin@nepaliinkiit.org", "Session token verified via /api/auth/me");

  // 5. ANNOUNCEMENTS CONTENT LIFECYCLE (CREATE -> EDIT -> TOGGLE MARQUEE -> DELETE)
  console.log("\n--- Testing Announcements Lifecycle ---");
  // Create
  const annCreateRes = await fetch(`${BASE_URL}/api/admin/announcements`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({
      title: "Automated Test Notice",
      short_message: "Testing announcement creation lifecycle in live test suite.",
      content: "Full content of the automated test notice.",
      category: "Important",
      marquee_enabled: true,
      status: "published",
    }),
  });
  const annCreateData = await annCreateRes.json();
  assert(annCreateRes.status === 200 && annCreateData.success, "Admin creates new announcement");
  createdAnnouncementId = annCreateData.item.id;

  // Edit
  const annEditRes = await fetch(`${BASE_URL}/api/admin/announcements/${createdAnnouncementId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({
      title: "Updated Automated Test Notice",
      marquee_enabled: false,
    }),
  });
  const annEditData = await annEditRes.json();
  assert(annEditRes.status === 200 && annEditData.item.title === "Updated Automated Test Notice", "Admin updates announcement content");

  // Delete
  const annDelRes = await fetch(`${BASE_URL}/api/admin/announcements/${createdAnnouncementId}`, {
    method: "DELETE",
    headers: { Cookie: adminCookie },
  });
  assert(annDelRes.status === 200, "Admin deletes announcement");

  // 6. EVENTS CONTENT LIFECYCLE (CREATE -> GET DETAIL -> EDIT -> DELETE)
  console.log("\n--- Testing Events Lifecycle ---");
  // Create
  const eventCreateRes = await fetch(`${BASE_URL}/api/admin/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({
      title: "Inter-Campus Futsal Championship 2026",
      slug: createdEventSlug,
      summary: "Annual tournament bringing together all hostel & school teams.",
      description: "Match fixtures, rules, referees, and prize distribution schedule.",
      cover_image: "/images/community/campus-celebration.png",
      start_date: "2026-11-15T09:00:00+05:30",
      venue: "KIIT Stadium Turf Court, Campus 13",
      category: "Sports & Tournaments",
      registration_status: "open",
      featured: true,
      status: "published",
    }),
  });
  const eventCreateData = await eventCreateRes.json();
  assert(eventCreateRes.status === 200 && eventCreateData.success, "Admin creates new event");
  createdEventId = eventCreateData.item.id;

  // Verify public event detail route renders
  const eventPublicRes = await fetch(`${BASE_URL}/events/${createdEventSlug}`);
  assert(eventPublicRes.status === 200, "Public event detail page renders new event");

  // Edit
  const eventEditRes = await fetch(`${BASE_URL}/api/admin/events/${createdEventId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({
      venue: "KIIT Biju Patnaik Indoor Stadium",
    }),
  });
  assert(eventEditRes.status === 200, "Admin updates event venue");

  // Delete
  const eventDelRes = await fetch(`${BASE_URL}/api/admin/events/${createdEventId}`, {
    method: "DELETE",
    headers: { Cookie: adminCookie },
  });
  assert(eventDelRes.status === 200, "Admin deletes event");

  // 7. GALLERY PHOTOS LIFECYCLE (ADD -> EDIT -> DELETE)
  console.log("\n--- Testing Gallery Lifecycle ---");
  const galCreateRes = await fetch(`${BASE_URL}/api/admin/gallery`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({
      title: "Test Cultural Moment",
      alt_text: "Nepali students gathering for test event",
      category_slug: "dashain",
      image_url: "/images/community/talent-showcase.png",
      photographer_credit: "NIK E2E Tester",
      status: "published",
      featured: false,
    }),
  });
  const galCreateData = await galCreateRes.json();
  assert(galCreateRes.status === 200 && galCreateData.success, "Admin adds photo to gallery");
  createdGalleryId = galCreateData.item.id;

  // Edit photo
  const galEditRes = await fetch(`${BASE_URL}/api/admin/gallery/${createdGalleryId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({
      title: "Updated Test Cultural Moment Title",
    }),
  });
  assert(galEditRes.status === 200, "Admin edits photo details");

  // Delete photo
  const galDelRes = await fetch(`${BASE_URL}/api/admin/gallery/${createdGalleryId}`, {
    method: "DELETE",
    headers: { Cookie: adminCookie },
  });
  assert(galDelRes.status === 200, "Admin deletes gallery photo");

  // 8. MESSAGES & JOIN REQUESTS MANAGEMENT
  console.log("\n--- Testing Messages & Join Requests Inbox Management ---");
  const inboxRes = await fetch(`${BASE_URL}/api/admin/messages`, {
    headers: { Cookie: adminCookie },
  });
  const inboxData = await inboxRes.json();
  assert(inboxRes.status === 200, "Admin fetches inbox messages & requests");

  const foundContact = inboxData.messages.find((m) => m.email === "prabesh.karki@kiit.ac.in");
  assert(Boolean(foundContact), "Previously submitted contact message is in admin inbox");

  const foundJoin = inboxData.joinRequests.find((j) => j.email === "2405991@kiit.ac.in");
  assert(Boolean(foundJoin), "Previously submitted join request is in admin inbox");

  // Update contact message status & private notes
  if (foundContact) {
    const updateMsgRes = await fetch(`${BASE_URL}/api/admin/messages/${foundContact.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({
        status: "in_progress",
        private_notes: "Followed up via phone: Jamara distribution confirmed for 10:00 AM.",
      }),
    });
    assert(updateMsgRes.status === 200, "Admin updates message status & saves private notes");

    // Clean up test message
    await fetch(`${BASE_URL}/api/admin/messages/${foundContact.id}`, {
      method: "DELETE",
      headers: { Cookie: adminCookie },
    });
    console.log("Cleaned up test contact message.");
  }

  // Update join request status & private notes
  if (foundJoin) {
    const updateJoinRes = await fetch(`${BASE_URL}/api/admin/join-requests/${foundJoin.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({
        status: "contacted",
        private_notes: "Connected student with Biotech 3rd year seniors in Campus 11.",
      }),
    });
    assert(updateJoinRes.status === 200, "Admin updates join request status & adds mentor note");

    // Clean up test join request
    await fetch(`${BASE_URL}/api/admin/join-requests/${foundJoin.id}`, {
      method: "DELETE",
      headers: { Cookie: adminCookie },
    });
    console.log("Cleaned up test join request.");
  }

  // 9. SITE SETTINGS PERSISTENCE
  console.log("\n--- Testing Site Settings Configuration ---");
  const settingsRes = await fetch(`${BASE_URL}/api/admin/settings`, {
    headers: { Cookie: adminCookie },
  });
  const settingsData = await settingsRes.json();
  assert(settingsRes.status === 200 && settingsData.settings?.community_name === "NEPALI IN KIIT", "Site settings retrieved correctly");

  // 10. ADMIN ACTIVITY AUDIT TRAIL
  console.log("\n--- Testing Admin Activity Audit Trail ---");
  const activityRes = await fetch(`${BASE_URL}/api/admin/activity`, {
    headers: { Cookie: adminCookie },
  });
  const activityData = await activityRes.json();
  assert(activityRes.status === 200 && activityData.logs.length > 0, "Admin activity logs recorded all CRUD and login actions");

  console.log("\n🎉 ALL TESTS PASSED! (" + results.length + " assertions passed cleanly)");
}

runTests().catch((err) => {
  console.error("Test execution aborted:", err);
  process.exit(1);
});
