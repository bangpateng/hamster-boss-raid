import { createLiveFeed, createMockFeed, type HamsterFeed } from "./feed";

// Live feed when VITE_SQUEEK_API_URL is set. Add ?demo to the page URL to force the demo feed.
export function pickFeed(): { feed: HamsterFeed; live: boolean } {
  const url = import.meta.env.VITE_SQUEEK_API_URL as string | undefined;
  const forceDemo = new URLSearchParams(location.search).has("demo");
  if (url && !forceDemo) return { feed: createLiveFeed(url), live: true };
  return { feed: createMockFeed(), live: false };
}
