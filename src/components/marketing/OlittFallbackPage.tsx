import Link from "next/link";

const olittPrimaryCta = "https://olitt.com";
const olittDomainsCta = "https://olitt.com";

interface OlittFallbackPageProps {
  host: string;
}

const offerCards = [
  {
    title: "AI websites that sell",
    description:
      "Launch a polished business website in less time with AI-assisted design, copy, structure, and brand-ready sections.",
  },
  {
    title: "E-commerce built for growth",
    description:
      "Turn traffic into revenue with beautiful storefronts, product-first layouts, payments, and conversion-focused experiences.",
  },
  {
    title: "WordPress, reimagined",
    description:
      "Get flexible WordPress sites with modern design direction, faster publishing, and less setup friction for your team.",
  },
  {
    title: "Domains in one place",
    description:
      "Secure your brand with the right domain and manage the path from idea to live site from a single platform.",
  },
];

const proofPoints = [
  "Sell products with modern storefront experiences",
  "Build service websites with AI-guided structure and content",
  "Launch WordPress sites faster with less manual setup",
  "Find and buy domains that fit your brand",
];

export function OlittFallbackPage({ host }: OlittFallbackPageProps) {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(139,92,246,0.28),_transparent_38%),radial-gradient(circle_at_bottom_left,_rgba(168,85,247,0.22),_transparent_32%)]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-14 px-6 py-20 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center rounded-full border border-[#a855f7]/40 bg-[#a855f7]/10 px-4 py-1 text-sm font-medium text-[#d8b4fe]">
              This domain is connected — now let’s turn it into a business.
            </div>
            <h1 className="mt-6 text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              Build your next website, store, or domain-powered brand with
              <span className="text-[#a855f7]"> Olitt</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72 sm:text-xl">
              We noticed{" "}
              <span className="font-semibold text-white">{host}</span> points
              here, but your storefront has not been launched yet. Olitt helps
              you create high-converting websites, e-commerce stores, and
              WordPress sites with AI — plus get the right domain to power it
              all.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href={olittPrimaryCta}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-2xl bg-[#a855f7] px-7 py-4 text-base font-bold text-white transition hover:bg-[#9333ea]"
              >
                Start building with Olitt
              </Link>
              <Link
                href={olittDomainsCta}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-7 py-4 text-base font-semibold text-white transition hover:border-[#a855f7]/50 hover:bg-white/10"
              >
                Get a domain on Olitt
              </Link>
            </div>
          </div>

          <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-[#a855f7]/10 backdrop-blur">
            <div className="rounded-[1.5rem] border border-white/10 bg-[#0f0f10] p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-[#d8b4fe]">
                    Olitt Growth Stack
                  </p>
                  <p className="mt-2 text-2xl font-bold text-white">
                    Launch faster. Sell smarter.
                  </p>
                </div>
                <div className="rounded-full bg-[#a855f7]/15 px-3 py-1 text-sm font-semibold text-[#d8b4fe]">
                  AI powered
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {proofPoints.map((point) => (
                  <div
                    key={point}
                    className="flex items-start gap-3 rounded-2xl border border-white/8 bg-black/30 px-4 py-4"
                  >
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#a855f7]" />
                    <p className="text-sm leading-6 text-white/80">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-18 sm:px-8 lg:px-10 lg:py-24">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#d8b4fe]">
            Everything you need to launch online
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
            One platform for websites, e-commerce, WordPress, and domains
          </h2>
          <p className="mt-4 text-lg leading-8 text-white/68">
            Whether you’re starting with an idea, migrating a business, or
            finally turning your domain into a real sales machine, Olitt gives
            you the tools and AI support to get live faster.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {offerCards.map((card) => (
            <article
              key={card.title}
              className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 shadow-lg shadow-black/30 transition hover:border-[#a855f7]/40 hover:bg-white/[0.06]"
            >
              <div className="mb-5 inline-flex rounded-2xl bg-[#a855f7]/12 px-3 py-2 text-sm font-bold text-[#d8b4fe]">
                Olitt
              </div>
              <h3 className="text-xl font-bold text-white">{card.title}</h3>
              <p className="mt-4 text-sm leading-7 text-white/70">
                {card.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#d8b4fe]">
              Why businesses choose Olitt
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
              More than a site builder — a launch partner for modern brands
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/68">
              We help brands move from “domain pointed” to “business live.” Use
              AI to generate structure, messaging, and momentum — then publish a
              site that looks serious, sells confidently, and grows with you.
            </p>
          </div>
          <div className="rounded-[2rem] border border-[#a855f7]/25 bg-[#0b0b0c] p-8">
            <div className="space-y-6">
              <div>
                <p className="text-4xl font-black text-white">24/7</p>
                <p className="mt-2 text-sm uppercase tracking-[0.25em] text-white/45">
                  AI-assisted creation flow
                </p>
              </div>
              <div className="h-px bg-white/10" />
              <div>
                <p className="text-4xl font-black text-white">4 in 1</p>
                <p className="mt-2 text-sm uppercase tracking-[0.25em] text-white/45">
                  Websites, e-commerce, WordPress, and domains
                </p>
              </div>
              <div className="h-px bg-white/10" />
              <div>
                <p className="text-4xl font-black text-white">1 goal</p>
                <p className="mt-2 text-sm uppercase tracking-[0.25em] text-white/45">
                  Get your business online and converting
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-18 sm:px-8 lg:px-10 lg:py-24">
        <div className="rounded-[2.25rem] border border-[#a855f7]/30 bg-[linear-gradient(135deg,rgba(168,85,247,0.18),rgba(255,255,255,0.03))] px-8 py-12 text-center shadow-2xl shadow-[#a855f7]/10 sm:px-10 lg:px-16 lg:py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#e9d5ff]">
            Ready to launch?
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            Let Olitt turn this connected domain into your next revenue engine.
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-white/78">
            Build a website. Launch an online store. Start a WordPress project.
            Buy the perfect domain. Do it all on Olitt with AI in your corner.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={olittPrimaryCta}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-w-[220px] items-center justify-center rounded-2xl bg-white px-7 py-4 text-base font-bold text-black transition hover:bg-[#f3e8ff]"
            >
              Visit Olitt.com
            </Link>
            <Link
              href={olittDomainsCta}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-w-[220px] items-center justify-center rounded-2xl border border-white/20 bg-black/30 px-7 py-4 text-base font-semibold text-white transition hover:border-white/40 hover:bg-black/40"
            >
              Explore domains and services
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
