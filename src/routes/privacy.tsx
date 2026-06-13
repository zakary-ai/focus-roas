import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | ROAS.ai" },
      {
        name: "description",
        content:
          "How ROAS.ai collects, uses, protects, and shares information for the ROAS.ai website and app.",
      },
    ],
  }),
  component: PrivacyPolicy,
});

const sections = [
  {
    title: "Information we collect",
    body: [
      "Account information, such as your name, email address, workspace details, team members, and authentication records.",
      "Business and advertising data you connect to ROAS.ai, including OpenAI Ads account details, campaign metadata, ad spend, performance metrics, Shopify store information, UTM links, and conversion events.",
      "Billing and subscription information needed to manage plans, invoices, and payment status. Payment card details are handled by our payment processors, not stored directly by ROAS.ai.",
      "Usage, device, and log data, such as pages viewed, app actions, browser type, IP address, timestamps, errors, and diagnostic events.",
      "Content you provide to support, onboarding, campaign builders, prompts, notes, and reporting workflows.",
    ],
  },
  {
    title: "How we use information",
    body: [
      "To operate the website, app, dashboards, integrations, campaign tools, conversion setup, billing, and support.",
      "To connect and sync data from services you authorize, including OpenAI Ads, Shopify, Supabase, billing providers, and related infrastructure providers.",
      "To generate reports, recommendations, and product insights. We may use aggregated or de-identified performance data to improve recommendations and benchmarks.",
      "To secure the service, prevent abuse, debug errors, enforce plan limits, and comply with legal obligations.",
      "To send service messages, product updates, onboarding guidance, and account notices. You can opt out of non-essential marketing messages.",
    ],
  },
  {
    title: "AI-assisted features",
    body: [
      "ROAS.ai may process campaign, store, workspace, and performance data through AI providers when you use AI-assisted features.",
      "We limit the data sent to what is needed for the feature, but you should avoid entering sensitive personal data, payment card data, passwords, or secrets into prompts or notes.",
    ],
  },
  {
    title: "Sharing and disclosure",
    body: [
      "We do not sell individual account, store, client, or customer-level data.",
      "We share information with service providers that help us run ROAS.ai, such as hosting, database, authentication, analytics, billing, communication, integration, and AI infrastructure providers.",
      "We may disclose information if required by law, to protect rights and safety, to investigate abuse, or as part of a business transfer such as a merger, acquisition, or sale of assets.",
    ],
  },
  {
    title: "Cookies and tracking",
    body: [
      "We use cookies, local storage, and similar technologies to keep you signed in, remember preferences, measure site and app usage, improve performance, and protect the service.",
      "Your browser may let you block cookies, but some parts of the app may not work correctly without them.",
    ],
  },
  {
    title: "Data retention and security",
    body: [
      "We keep information for as long as needed to provide the service, meet legal and accounting requirements, resolve disputes, enforce agreements, and maintain backups.",
      "We use administrative, technical, and organizational safeguards designed to protect information. No online service can guarantee perfect security.",
    ],
  },
  {
    title: "Your choices",
    body: [
      "You can update account and workspace details in the app, disconnect integrations, revoke third-party access, and contact us to request access, correction, export, or deletion of personal information.",
      "Some requests may be limited by security, legal, billing, backup, or fraud-prevention requirements.",
    ],
  },
  {
    title: "International users and children",
    body: [
      "ROAS.ai is operated from the United States. If you use it from another country, your information may be processed in the United States or other locations where our providers operate.",
      "ROAS.ai is not intended for children under 13, and we do not knowingly collect personal information from children under 13.",
    ],
  },
  {
    title: "Changes and contact",
    body: [
      "We may update this policy from time to time. The latest version will be posted on this page with a revised effective date.",
      "Questions or privacy requests can be sent to zakary@deleo.ai.",
    ],
  },
];

function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-6 py-10 md:py-14">
        <Link
          to="/"
          className="inline-flex text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Back to ROAS.ai
        </Link>

        <header className="mt-12 border-b pb-10">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Legal
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">Privacy Policy</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            This policy explains how ROAS.ai collects, uses, protects, and shares information when
            you use our website, app, dashboards, integrations, and related services.
          </p>
          <p className="mt-5 text-sm text-muted-foreground">Effective date: June 13, 2026</p>
        </header>

        <div className="space-y-10 py-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-2xl font-semibold tracking-tight">{section.title}</h2>
              <ul className="mt-4 space-y-3 text-base leading-7 text-muted-foreground">
                {section.body.map((item) => (
                  <li key={item} className="border-l pl-4">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
