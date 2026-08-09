// Client-side admin gate password.
// NOTE: This is a light convenience lock only — it lives in the frontend bundle
// and is not real security. Anyone determined can read it.
export const ADMIN_PW =
  (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) || "vibes2026";
