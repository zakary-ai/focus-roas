import { createFileRoute, Link } from "@tanstack/react-router";

import landingCss from "@/components/landing/landing.css?url";
import SiteHeader from "@/components/landing/SiteHeader";
import SiteFooter from "@/components/landing/SiteFooter";
import {
  ACCENT,
  BORDER,
  fontBody,
  fontDisplay,
  INK,
  MUTED,
  SITE_URL,
} from "@/components/landing/shared";
import { posts } from "@/content/blog-posts";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "ChatGPT Ads Blog — Strategy, Tracking & Measurement | OpenROAS" },
      {
        name: "description",
        content:
          "Guides on ChatGPT Ads and OpenAI advertising: campaign strategy, conversion tracking, revenue attribution, and turning AI ads into a measurable channel.",
      },
      {
        name: "keywords",
        content:
          "ChatGPT ads, OpenAI ads, ChatGPT advertising, AI ads tracking, ChatGPT ads attribution",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "ChatGPT Ads Blog — Strategy, Tracking & Measurement" },
      {
        property: "og:description",
        content:
          "Guides on ChatGPT Ads strategy, conversion tracking, and revenue attribution from OpenROAS.",
      },
      { property: "og:url", content: `${SITE_URL}/blog` },
    ],
    links: [
      { rel: "stylesheet", href: landingCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Sora:wght@500;600&display=swap",
      },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "canonical", href: `${SITE_URL}/blog` },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  return (
    <div className="landing-root">
      <SiteHeader />
      <main
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "clamp(8rem, 16vh, 11rem) clamp(1.5rem, 6vw, 4rem) clamp(4rem, 8vw, 6rem)",
        }}
      >
        <p
          style={{
            fontFamily: fontBody,
            fontSize: "0.65rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: ACCENT,
            marginBottom: "1.1rem",
          }}
        >
          OpenROAS Blog
        </p>
        <h1
          style={{
            fontFamily: fontDisplay,
            fontWeight: 600,
            fontSize: "clamp(2.2rem, 4.5vw, 3.8rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "#fff",
            maxWidth: 760,
            marginBottom: "1.1rem",
          }}
        >
          ChatGPT Ads, measured.
        </h1>
        <p
          style={{
            fontFamily: fontBody,
            fontWeight: 300,
            fontSize: "1.05rem",
            lineHeight: 1.6,
            color: INK,
            maxWidth: 560,
            marginBottom: "clamp(2.5rem, 5vw, 4rem)",
          }}
        >
          Practical guides on ChatGPT Ads strategy, conversion tracking, attribution, and building
          an AI advertising channel you can actually measure.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1px",
            background: "rgba(245,166,35,0.1)",
            border: "1px solid rgba(245,166,35,0.1)",
          }}
        >
          {posts.map((post) => (
            <article key={post.slug} style={{ background: "#0C1018" }}>
              <Link
                to="/blog/$slug"
                params={{ slug: post.slug }}
                style={{ display: "block", padding: "clamp(1.5rem, 3vw, 2.25rem)" }}
                className="lp-post-card"
              >
                <div
                  style={{
                    display: "flex",
                    gap: "0.9rem",
                    alignItems: "center",
                    marginBottom: "0.8rem",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontFamily: fontBody,
                      fontSize: "0.62rem",
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: ACCENT,
                      border: "1px solid rgba(245,166,35,0.35)",
                      borderRadius: 999,
                      padding: "0.25rem 0.7rem",
                    }}
                  >
                    {post.tag}
                  </span>
                  <span style={{ fontFamily: fontBody, fontSize: "0.78rem", color: MUTED }}>
                    <time dateTime={post.date}>
                      {new Date(`${post.date}T00:00:00`).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                    {" · "}
                    {post.readingTime}
                  </span>
                </div>
                <h2
                  style={{
                    fontFamily: fontDisplay,
                    fontWeight: 500,
                    fontSize: "clamp(1.3rem, 2.4vw, 1.7rem)",
                    lineHeight: 1.2,
                    color: "#fff",
                    marginBottom: "0.6rem",
                  }}
                >
                  {post.title}
                </h2>
                <p
                  style={{
                    fontFamily: fontBody,
                    fontWeight: 300,
                    fontSize: "0.95rem",
                    lineHeight: 1.6,
                    color: INK,
                    maxWidth: 720,
                    marginBottom: "0.9rem",
                  }}
                >
                  {post.description}
                </p>
                <span
                  style={{
                    fontFamily: fontBody,
                    fontWeight: 500,
                    fontSize: "0.7rem",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: ACCENT,
                  }}
                >
                  Read the guide →
                </span>
              </Link>
            </article>
          ))}
        </div>

        <p
          style={{
            fontFamily: fontBody,
            fontSize: "0.85rem",
            color: MUTED,
            marginTop: "2rem",
            borderTop: `1px solid ${BORDER}`,
            paddingTop: "1.5rem",
          }}
        >
          Want the system behind the writing?{" "}
          <a href="/#system" style={{ color: ACCENT }}>
            Explore the OpenROAS System
          </a>
          .
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
