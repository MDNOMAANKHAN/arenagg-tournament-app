import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How ARENAGG collects, uses, stores and protects information submitted through its community esports platform.",
  alternates: { canonical: "/privacy" },
};

const sections = [
  ["1. Information we collect", "When you register, we may collect team name, captain and player names, in-game IDs, a captain contact detail, optional substitute details, tournament selections, payment screenshots and optional UPI transaction references. We also receive basic technical information such as IP address, browser/device information and request timestamps for security, abuse prevention and service operation."],
  ["2. How we use information", "We use information to process and manage tournament registrations, verify eligibility and payments, communicate with captains about tournament operations, publish team names and results where relevant, prevent duplicate or fraudulent registrations, protect the website, resolve support requests and meet legal obligations."],
  ["3. Payment information", "Payments are handled using the payment method displayed for a tournament. ARENAGG may receive a payment screenshot or transaction reference for manual verification. We do not ask you to share your UPI PIN, banking password, card PIN or one-time password. Do not send these secrets to us."],
  ["4. Sharing and disclosure", "Registration information may be accessible to authorised tournament organisers for administration and verification. We may use hosting, database, security and communication service providers to operate the platform. We may disclose information where required by law, to respond to lawful requests, protect users or enforce platform rules. We do not sell personal information."],
  ["5. Public information", "Team names, tournament participation and published results may appear publicly on ARENAGG. Do not include private contact details or sensitive information in a team name or other public-facing field."],
  ["6. Storage and security", "We use access controls and reasonable technical and organisational safeguards intended to protect submitted information. No internet transmission or storage system can be guaranteed completely secure. Access to payment proof and registration records should be limited to authorised organisers."],
  ["7. Retention", "We keep registration and related records for as long as reasonably necessary to administer tournaments, maintain result and payment records, address disputes, enforce rules and comply with applicable legal requirements. Retention periods may vary according to the type of information and purpose."],
  ["8. Your choices and requests", "You may contact us to request access, correction or deletion of personal information, subject to identity verification, legal requirements and records we reasonably need to retain. We may need to keep limited records where required for accounting, dispute resolution, security or legal compliance."],
  ["9. Children and guardian approval", "If you are under 18, you must obtain parent or legal guardian review and approval before submitting personal information or participating. A parent or guardian may contact us with a privacy request concerning a minor."],
  ["10. Third-party services and links", "The platform may link to WhatsApp, payment apps, game services or other third-party websites. Their privacy practices are governed by their own policies; please review them before sharing information."],
  ["11. Changes to this policy", "We may update this policy as our services or legal obligations change. The current version and effective date will be displayed on this page. Where required, we will take additional steps to notify affected users."],
  ["12. Contact", "For access, correction or deletion requests, submit the Privacy Request form at /privacy-request or call 7330804540. We will verify identity and review legal retention requirements before taking action. Please avoid sending passwords, OTPs, UPI PINs or other authentication secrets in support messages."],
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-8 sm:py-16">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">ARENAGG · Legal</p>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">Privacy Policy</h1>
      <p className="mt-4 text-sm text-slate-400">Version 1.0 · Effective 18 November 2026 · Last updated 18 November 2026</p>
      <div className="mt-8 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.04] p-5 text-sm leading-7 text-slate-300">
        This policy explains what information ARENAGG collects, why it is used, who may access it and how you can contact us about your information.
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
        This is a general privacy-policy draft based on the features currently described for ARENAGG. Confirm the actual data flows, service providers, retention practices and legal requirements with a qualified privacy professional before publication.
      </p>
      <Link href="/privacy-request" className="mt-5 inline-flex font-semibold text-cyan-300 hover:text-white">Submit a Privacy Request →</Link>\n      <Link href="/terms" className="mt-5 inline-flex font-semibold text-cyan-300 hover:text-white">Read the Terms & Conditions →</Link>
    </main>
  );
}
