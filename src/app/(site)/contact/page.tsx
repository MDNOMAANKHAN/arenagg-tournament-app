import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact ARENAGG",
  description:
    "Contact the ARENAGG team by phone or join the official WhatsApp channel for community and tournament updates.",
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    title: "Contact ARENAGG",
    description: "Get in touch with the ARENAGG team and follow official updates.",
    url: "/contact",
  },
};

const phone = "7330804540";
const whatsappChannel =
  "https://whatsapp.com/channel/0029VbEYQeV6mYPQJ4YFF62Q?utm_source=chatgpt.com";

export default function ContactPage() {
  return (
    <main className="arena-page relative min-h-screen overflow-hidden px-4 py-10 sm:px-8 sm:py-14">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-600/[0.08] blur-[120px]" />
        <div className="absolute -right-40 top-[35%] h-96 w-96 rounded-full bg-cyan-500/[0.07] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        <header className="mb-8">
          <p className="text-xs font-black tracking-[0.3em] text-cyan-300">WE'RE HERE TO HELP</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-6xl">
            Contact Us
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Have a question about a tournament or your registration? Reach out
            to the ARENAGG team using the contact details below.
          </p>
        </header>

        <div className="grid gap-5 sm:grid-cols-2">
          <section className="arena-premium-card rounded-2xl border border-blue-300/15 bg-[#0b1424]/85 p-6 sm:p-8">
            <div className="text-3xl" aria-hidden="true">📞</div>
            <h2 className="mt-4 text-xl font-black text-white">Call us</h2>
            <p className="mt-2 text-sm leading-7 text-slate-400">
              Contact us by phone for assistance with ARENAGG.
            </p>
            <a
              href={`tel:${phone}`}
              className="arena-glass-button mt-6 w-full sm:w-auto"
              aria-label={`Call ARENAGG at ${phone}`}
            >
              {phone}
            </a>
          </section>

          <section className="arena-premium-card rounded-2xl border border-blue-300/15 bg-[#0b1424]/85 p-6 sm:p-8">
            <div className="text-3xl" aria-hidden="true">💬</div>
            <h2 className="mt-4 text-xl font-black text-white">WhatsApp Channel</h2>
            <p className="mt-2 text-sm leading-7 text-slate-400">
              Join our channel for official community announcements and
              tournament updates.
            </p>
            <a
              href={whatsappChannel}
              target="_blank"
              rel="noopener noreferrer"
              className="arena-glass-button mt-6 w-full sm:w-auto"
            >
              Join ARENAGG Channel <span aria-hidden="true">↗</span>
            </a>
          </section>
        </div>

        <p className="mt-8 rounded-xl border border-amber-300/15 bg-amber-300/[0.05] p-4 text-xs leading-6 text-slate-400">
          For your safety, use only the official contact details published on
          this website. Do not send payments to other users or unverified
          numbers.
        </p>
      </div>
    </main>
  );
}
