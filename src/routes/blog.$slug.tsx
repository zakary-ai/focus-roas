import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import landingCss from "@/components/landing/landing.css?url";
import SiteHeader from "@/components/landing/SiteHeader";
import SiteFooter from "@/components/landing/SiteFooter";
import {
  ACCENT,
  BOOK_CALL_URL,
  BORDER,
  fontBody,
  fontDisplay,
  INK,
  MUTED,
  SITE_URL,
} from "@/components/landing/shared";
import { getPost, posts } from "@/content/blog-posts";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "OpenROAS Blog" }] };
    const url = `${SITE_URL}/blog/${loaderData.slug}`;
    return {
      meta: [
        { title: loaderData.metaTitle },
        { name: "description", content: loaderData.description },
        { name: "keywords", content: loaderData.keywords.join(", ") },
        { property: "og:type", content: "article" },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: loaderData.description },
        { property: "og:url", content: url },
        { property: "article:published_time", content: loaderData.date },
      ],
      links: [
        { rel: "stylesheet", href: landingCss },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Sora:wght@500;600&display=swap",
        },
        { rel: "icon", type: "image/png", href: "/favicon.png" },
        { rel: "canonical", href: url },
      ],
    };
  },
  component: BlogPost,
});

const h2Style = {
  fontFamily: fontDisplay,
  fontWeight: 500,
  fontSize: "clamp(1.35rem, 2.6vw, 1.8rem)",
  lineHeight: 1.2,
  color: "#fff",
  margin: "2.4rem 0 0.9rem",
} as const;

const pStyle = {
  fontFamily: fontBody,
  fontWeight: 300,
  fontSize: "1.02rem",
  lineHeight: 1.75,
  color: INK,
  marginBottom: "1.1rem",
} as const;

function BlogPost() {
  const post = Route.useLoaderData();
  const related = posts.filter((p) => p.slug !== post.slug).slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    keywords: post.keywords.join(", "),
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${post.slug}` },
    author: { "@type": "Organization", name: "OpenROAS", url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: "OpenROAS",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
  };

  return (
    <div className="landing-root">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />
      <main
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "clamp(8rem, 16vh, 11rem) clamp(1.5rem, 6vw, 3rem) clamp(4rem, 8vw, 6rem)",
        }}
      >
        <nav aria-label="Breadcrumb" style={{ marginBottom: "1.5rem" }}>
          <Link
            to="/blog"
            style={{
              fontFamily: fontBody,
              fontSize: "0.72rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: ACCENT,
            }}
          >
            ← All articles
          </Link>
        </nav>

        <article>
          <header style={{ marginBottom: "2rem" }}>
            <div
              style={{
                display: "flex",
                gap: "0.9rem",
                alignItems: "center",
                flexWrap: "wrap",
                marginBottom: "1rem",
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
              <span style={{ fontFamily: fontBody, fontSize: "0.8rem", color: MUTED }}>
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
            <h1
              style={{
                fontFamily: fontDisplay,
                fontWeight: 600,
                fontSize: "clamp(1.9rem, 4vw, 3rem)",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                color: "#fff",
              }}
            >
              {post.title}
            </h1>
          </header>

          {post.intro.map((para) => (
            <p key={para.slice(0, 32)} style={{ ...pStyle, fontSize: "1.08rem" }}>
              {para}
            </p>
          ))}

          {post.blocks.map((block, i) => (
            <section key={block.h2 ?? i}>
              {block.h2 && <h2 style={h2Style}>{block.h2}</h2>}
              {block.p?.map((para) => (
                <p key={para.slice(0, 32)} style={pStyle}>
                  {para}
                </p>
              ))}
              {block.ul && (
                <ul
                  style={{
                    margin: "0 0 1.1rem 1.2rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.55rem",
                  }}
                >
                  {block.ul.map((item) => (
                    <li key={item.slice(0, 32)} style={{ ...pStyle, marginBottom: 0 }}>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <p
            style={{
              ...pStyle,
              color: "#fff",
              borderLeft: `2px solid ${ACCENT}`,
              border: `1px solid rgba(245,166,35,0.18)`,
              borderLeftWidth: 2,
              borderLeftColor: ACCENT,
              background: "rgba(245,166,35,0.06)",
              padding: "1.1rem 1.3rem",
              marginTop: "2.2rem",
            }}
          >
            {post.takeaway}
          </p>
        </article>

        <aside
          style={{
            marginTop: "3rem",
            border: `1px solid ${BORDER}`,
            borderRadius: 12,
            background: "#0C1018",
            padding: "clamp(1.5rem, 3vw, 2rem)",
          }}
        >
          <h2
            style={{
              fontFamily: fontDisplay,
              fontWeight: 500,
              fontSize: "1.25rem",
              color: "#fff",
              marginBottom: "0.6rem",
            }}
          >
            Want ChatGPT Ads without the guesswork?
          </h2>
          <p style={{ ...pStyle, fontSize: "0.95rem" }}>
            OpenROAS handles the strategy, campaigns, landing pages, tracking, and attribution — so
            every dollar of spend reports back as measurable results.
          </p>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <a
              href={BOOK_CALL_URL}
              className="lp-cta-primary"
              style={{
                fontFamily: fontBody,
                fontWeight: 500,
                fontSize: "0.68rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                background: ACCENT,
                color: "#02080D",
                border: `1px solid ${ACCENT}`,
                padding: "0.8rem 1.8rem",
                borderRadius: 2,
              }}
            >
              Book a Strategy Call
            </a>
            <a
              href="/#system"
              style={{
                fontFamily: fontBody,
                fontWeight: 500,
                fontSize: "0.68rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.25)",
                padding: "0.8rem 1.6rem",
                borderRadius: 2,
              }}
            >
              See the System
            </a>
          </div>
        </aside>

        {related.length > 0 && (
          <nav aria-label="Related articles" style={{ marginTop: "2.5rem" }}>
            <h2
              style={{
                fontFamily: fontBody,
                fontSize: "0.68rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: MUTED,
                marginBottom: "1rem",
              }}
            >
              Keep reading
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to="/blog/$slug"
                  params={{ slug: r.slug }}
                  style={{
                    fontFamily: fontDisplay,
                    fontWeight: 500,
                    fontSize: "1.05rem",
                    color: INK,
                    borderBottom: `1px solid ${BORDER}`,
                    paddingBottom: "0.7rem",
                  }}
                >
                  {r.title} <span style={{ color: ACCENT }}>→</span>
                </Link>
              ))}
            </div>
          </nav>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
