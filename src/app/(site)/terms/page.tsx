import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms governing use of the ARENAGG community esports platform and tournament participation.",
  alternates: { canonical: "/terms" },
};

const sections = [
  ["1. About ARENAGG", "ARENAGG is an independent community esports platform that publishes community tournaments, registration information and results. It is not the developer, owner or official representative of Free Fire MAX, BGMI, Valorant or their publishers."],
  ["2. Eligibility and accounts", "You must provide accurate, current information and be legally able to participate under the rules applicable to you. If you are under 18, a parent or legal guardian must review these terms and approve your participation. We may request reasonable confirmation of guardian approval where appropriate."],
  ["3. Tournament rules and fair play", "Participants must follow the rules displayed on the relevant tournament page and instructions communicated by the organiser. Cheating, use of unauthorised tools, impersonation, harassment, collusion, result manipulation or disruptive conduct may lead to removal from a tournament and disqualification."],
  ["4. Registration and team details", "A registration is a request to participate, not a guarantee of a place. A place is subject to tournament capacity, eligibility, accurate team details and any organiser verification. Do not submit another person's personal information unless you have permission to do so."],
  ["5. Entry fees and payments", "Where an entry fee applies, the amount and payment instructions should be shown on the tournament page. Payment proof may be reviewed manually by the organiser. A submitted screenshot or payment reference does not itself mean payment has been verified or a registration approved. Any refund, cancellation or rescheduling arrangement will be communicated for the relevant tournament and must comply with applicable law."],
  ["6. Prizes and results", "Prize details, eligibility, scoring and distribution arrangements must be stated in the relevant tournament announcement. Results may be reviewed before publication. ARENAGG does not guarantee a prize unless the organiser has expressly confirmed it and the participant has met the published requirements."],
  ["7. Cancellations and changes", "The organiser may modify schedules, formats, eligibility requirements or cancel a tournament where reasonably necessary, including for technical issues, insufficient participation, safety, suspected misconduct or circumstances outside its control. Material changes will be communicated through available platform channels."],
  ["8. Acceptable use", "You must not misuse the website, attempt unauthorised access, interfere with its operation, upload malicious content, abuse registration or contact channels, or use the platform for unlawful activity."],
  ["9. Platform availability and third parties", "The website and tournament services are provided on an as-available basis. We aim to keep information accurate and services reliable but cannot promise uninterrupted access. Game publishers, payment providers, hosting providers and communication platforms operate independently under their own terms."],
  ["10. Liability", "To the extent permitted by applicable law, ARENAGG is not responsible for indirect loss arising from use of the platform, third-party services, network interruptions or events outside our reasonable control. Nothing in these terms excludes rights or liability that cannot legally be excluded."],
  ["11. Privacy", "Personal information is handled as described in our Privacy Policy. Please read it before submitting registration details."],
  ["12. Changes and contact", "We may update these terms when the platform or applicable requirements change. The current version and effective date will be shown on this page. For questions, use the Contact & Support page or call 7330804540."],
];

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-8 sm:py-16">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">ARENAGG · Legal</p>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">Terms & Conditions</h1>
      <p className="mt-4 text-sm text-slate-400">Version 1.0 · Effective 18 November 2026 · Last updated 18 November 2026</p>
      <div className="mt-8 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.04] p-5 text-sm leading-7 text-slate-300">
        Please read these terms carefully before using ARENAGG or registering for a tournament. By checking the acceptance box during registration, you confirm that you agree to these terms.
      </div>
      <div className="mt-10 space-y-8">
        {sections.map(([heading, body]) => (
          <section key={heading}>
            <h2 className="text-lg font-bold text-white">{heading}</h2>
            <p className="mt-2 leading-7 text-slate-300">{body}</p>
          </section>
        ))}
      </div>
      <p className="mt-10 border-t border-white/10 pt-6 text-sm leading-6 text-slate-400">
        This is a general platform policy draft, not legal advice. Have the final wording reviewed by a qualified lawyer in India before relying on it for commercial or legal protection.
      </p>
      <Link href="/privacy" className="mt-5 inline-flex font-semibold text-cyan-300 hover:text-white">Read the Privacy Policy →</Link>
    </main>
  );
}
