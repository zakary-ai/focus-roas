/**
 * OpenROAS blog content registry.
 *
 * To publish a new post: add an object to `posts` (newest first), then add its
 * URL to public/sitemap.xml. Slugs become /blog/<slug>. Keep descriptions
 * under ~160 characters — they're the meta description Google shows.
 */

export type PostBlock = {
  h2?: string;
  p?: string[];
  ul?: string[];
};

export type Post = {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  date: string; // ISO, e.g. "2026-07-27"
  readingTime: string;
  tag: string;
  keywords: string[];
  intro: string[];
  blocks: PostBlock[];
  takeaway: string;
};

export const posts: Post[] = [
  {
    slug: "what-are-chatgpt-ads",
    title: "What Are ChatGPT Ads? A Practical Guide for Businesses",
    metaTitle: "What Are ChatGPT Ads? A Practical Guide for Businesses | OpenROAS",
    description:
      "What ChatGPT Ads are, how advertising inside AI conversations differs from search and social, and how to decide if the channel fits your business.",
    date: "2026-07-27",
    readingTime: "7 min read",
    tag: "Fundamentals",
    keywords: [
      "ChatGPT ads",
      "OpenAI ads",
      "advertising in ChatGPT",
      "AI advertising",
      "ChatGPT ads for business",
    ],
    intro: [
      "ChatGPT Ads are paid placements that appear inside ChatGPT conversations — shown alongside answers when someone asks about a problem, product, or purchase decision that your business can help with.",
      "For advertisers, this is a genuinely new kind of inventory. It isn't a search results page and it isn't a social feed. It's a conversation, and the person on the other side is often mid-decision: comparing options, asking for recommendations, or working out how to solve a problem your product solves.",
      "This guide covers how the channel works at a practical level, how it differs from the channels you already run, and how to think about whether — and how — to test it.",
    ],
    blocks: [
      {
        h2: "How ChatGPT Ads work",
        p: [
          "Advertisers create campaigns that target the topics and intents people express in conversation. When a relevant conversation happens, an ad — typically a product or service recommendation with a link — can be shown to the user alongside the assistant's answer.",
          "The click behaves like any other paid click: the user lands on your site or landing page. What's different is the context before the click. Instead of typing a two-word query, the person may have described their situation in detail — which tends to mean the visitors who do click arrive with clearer intent.",
        ],
      },
      {
        h2: "How the channel differs from search and social",
        ul: [
          "Intent expression: users describe problems conversationally, not in keywords — targeting works at the level of topics and intent rather than exact search terms.",
          "Position in the journey: many conversations happen while a decision is being formed, closer to consideration than cold discovery.",
          "Creative format: the 'creative' is closer to a recommendation than a banner — messaging that matches how people actually phrase their problem performs differently than repurposed search copy.",
          "Measurement: it's a young channel, so platform-side reporting is thinner than mature ad platforms — which makes your own tracking and attribution more important, not less.",
        ],
      },
      {
        h2: "Who should consider testing ChatGPT Ads",
        p: [
          "The channel tends to make sense when your customers plausibly ask an AI assistant about the problem you solve. A few examples of that pattern:",
        ],
        ul: [
          "SaaS and AI products — people ask assistants to recommend tools for a job.",
          "E-commerce brands — shoppers ask for product recommendations and comparisons.",
          "Professional services — people describe a situation and ask who can help.",
          "Local and experience-based businesses — people ask what to do, book, or visit.",
        ],
      },
      {
        h2: "The mistake to avoid: launching without measurement",
        p: [
          "Because the channel is new, most businesses run their first ChatGPT Ads campaigns without conversion tracking wired up — and then judge the channel on clicks and feel. That's how promising channels get shut down and bad ones keep getting budget.",
          "Before spending meaningfully, you want three things in place: tagged links so every click is identifiable, conversion events flowing from your site, CRM, or store, and attribution that ties revenue back to the specific campaign and ad. With those in place, the question 'is this channel working?' has an actual answer.",
        ],
      },
      {
        h2: "Frequently asked questions",
        p: [
          "Is the traffic quality good? Quality varies by targeting and offer, like every channel. The structural advantage is context: people often click after describing their need in detail. Whether that converts depends on how well your landing page matches the conversation.",
          "How much budget do you need to test? Enough to reach statistical signal on your conversion event — a function of your conversion rate and price point, not a fixed number. A measured small test beats an unmeasured large one.",
          "Can you attribute revenue to it? Yes — with click identifiers captured at the landing page, passed through to your conversion systems, and matched to orders or deals. That's the core of what a measurement setup for this channel does.",
        ],
      },
    ],
    takeaway:
      "ChatGPT Ads put your offer in front of people while they're describing the exact problem you solve. Treat it like any serious channel: enter with tracking, attribution, and a landing page built for the conversation — then let measured revenue decide the budget.",
  },
  {
    slug: "chatgpt-ads-conversion-tracking",
    title: "How to Track ChatGPT Ads Conversions and Attribute Revenue",
    metaTitle: "ChatGPT Ads Conversion Tracking & Revenue Attribution Guide | OpenROAS",
    description:
      "A step-by-step framework for tracking ChatGPT Ads: tagged links, click IDs, conversion events, CRM and store attribution, and validation before launch.",
    date: "2026-07-27",
    readingTime: "8 min read",
    tag: "Tracking",
    keywords: [
      "ChatGPT ads tracking",
      "OpenAI ads conversion tracking",
      "ChatGPT ads attribution",
      "AI ads ROAS",
      "revenue attribution",
    ],
    intro: [
      "The hardest part of ChatGPT Ads isn't launching campaigns — it's knowing what happened after the click. Platform dashboards can tell you about impressions and clicks; they can't tell you which campaign produced a customer.",
      "This is the framework we use to make ChatGPT Ads measurable end to end: from the tagged link on the ad, through the landing page, into your CRM or store, and back out as revenue attributed to a specific campaign, ad group, ad, and click.",
    ],
    blocks: [
      {
        h2: "Step 1 — Make every click identifiable",
        p: [
          "Every ad destination URL should carry identifiers for the campaign, ad group, ad, and the individual click. If the platform provides a click ID parameter, capture it; add your own campaign parameters alongside it.",
          "This is the foundation everything else stands on: a click you can't identify is a conversion you can't attribute.",
        ],
      },
      {
        h2: "Step 2 — Capture attribution at the landing page",
        p: [
          "When the visitor lands, store the click identifiers (first-party cookie or local storage) so they survive navigation. Don't capture only on the landing page — persist on every page view, because people leave, come back, and convert later from a different entry point.",
        ],
      },
      {
        h2: "Step 3 — Attach attribution to the conversion, not the visit",
        p: [
          "When the visitor converts — submits a form, books a call, starts a checkout — the stored identifiers should travel with that event into the system that records it: a hidden field into your CRM, cart attributes into your store, metadata into your booking or billing system.",
          "This is the step most setups skip, and it's why so many businesses end up with a pile of conversions labeled 'direct / none'.",
        ],
      },
      {
        h2: "Step 4 — Match conversions to revenue",
        ul: [
          "E-commerce: match the order (webhook or API) to the stored click ID, then roll revenue up to the ad and campaign.",
          "Lead gen: track the lead through CRM stages so attribution follows it from 'form submitted' to 'qualified' to 'closed won' — the channel's real performance is measured in closed revenue, not form fills.",
          "Subscriptions: attribute the trial start, then the conversion to paid, so you can see cost per paying customer by campaign.",
        ],
      },
      {
        h2: "Step 5 — Validate before you spend",
        p: [
          "Before scaling budget, run a test click through the entire pipeline: click a tagged link, confirm the click ID is captured, submit a test conversion, and verify it lands in your reporting attributed to the right campaign. Every link, form, event, and integration — tested, not assumed.",
          "A broken parameter or a form that drops hidden fields silently costs you the whole channel's data, and you usually find out weeks later.",
        ],
      },
      {
        h2: "What good looks like",
        p: [
          "When the system is wired correctly, you can answer questions like: which campaign produced the most closed revenue last month? What's my cost per qualified lead by ad group? Which landing page converts ChatGPT traffic best? Those answers — not click counts — are what let you scale spend with confidence.",
        ],
      },
    ],
    takeaway:
      "Tracking ChatGPT Ads is a chain: identifiable clicks → captured attribution → attribution attached to conversions → conversions matched to revenue → everything validated before launch. Build the chain once, and every optimization decision afterward gets easier.",
  },
  {
    slug: "chatgpt-ads-vs-google-ads",
    title: "ChatGPT Ads vs. Google Ads: How to Think About the New Channel",
    metaTitle: "ChatGPT Ads vs. Google Ads: A Framework for Budget Decisions | OpenROAS",
    description:
      "How ChatGPT Ads compare to Google Ads on intent, targeting, creative, and measurement — and a practical framework for when to add the new channel.",
    date: "2026-07-27",
    readingTime: "6 min read",
    tag: "Strategy",
    keywords: [
      "ChatGPT ads vs Google ads",
      "OpenAI ads strategy",
      "AI advertising channel",
      "ChatGPT advertising budget",
    ],
    intro: [
      "Every new ad channel gets the same question: should budget move there from what already works? For ChatGPT Ads the honest answer is the boring one — it depends on where your customers make decisions and whether you can measure the outcome.",
      "Here's a framework for comparing the channels on the dimensions that actually drive results, without hype in either direction.",
    ],
    blocks: [
      {
        h2: "Intent: keywords vs. conversations",
        p: [
          "Google captures intent expressed as queries; years of search history mean the intent taxonomy is mature and auction prices reflect it. ChatGPT captures intent expressed as conversation — often richer ('we're a 12-person agency and need a way to report ad performance to clients') but newer, with less competitive saturation.",
          "Neither is 'better'. Search intent is explicit and high-volume; conversational intent is descriptive and often closer to a decision.",
        ],
      },
      {
        h2: "Creative: ads vs. recommendations",
        p: [
          "Search ads compete on a results page. In a conversation, an ad functions more like a recommendation in context — which rewards messaging that speaks to the situation the user described rather than generic category copy. Teams that treat ChatGPT Ads creative as its own discipline, and test message variants deliberately, tend to learn faster.",
        ],
      },
      {
        h2: "Measurement: mature dashboards vs. your own infrastructure",
        p: [
          "Google gives you deep (if self-graded) reporting out of the box. ChatGPT Ads reporting is younger — so the burden of truth shifts to your own tracking: tagged links, click identifiers, conversion events from your CRM or store, and revenue attribution you control.",
          "That's extra work, but it comes with an upside: a measurement system you own reports on every channel with the same yardstick, instead of each platform grading its own homework.",
        ],
      },
      {
        h2: "A practical framework for adding the channel",
        ul: [
          "Keep what works: don't fund the test by cutting your proven channel below its efficient spend.",
          "Start where intent overlaps: pick the offer whose buyers most plausibly ask an assistant for help.",
          "Build measurement first: tagged links, conversion events, and attribution before the first dollar of spend.",
          "Give the test a fair window: long enough to reach signal on your real conversion event, not just clicks.",
          "Compare on business outcomes: cost per qualified lead, cost per order, attributed revenue — the same yardstick you hold Google to.",
        ],
      },
      {
        h2: "The realistic outcome",
        p: [
          "For most businesses this isn't an either/or. Search keeps doing what search does; ChatGPT Ads becomes a second intent channel with less auction pressure and a different creative surface. The winners in new channels are rarely the biggest spenders — they're the teams who can see what's working first and shift budget while everyone else is guessing.",
        ],
      },
    ],
    takeaway:
      "Don't frame it as ChatGPT Ads versus Google Ads — frame it as adding a second intent channel with a measurement system that judges both by the same standard: attributed revenue. Test where your customers' conversations overlap your offer, and let the data allocate the budget.",
  },
];

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
