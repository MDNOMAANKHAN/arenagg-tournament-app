import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "ARENAGG privacy notice explaining information collection, use, sharing, retention and privacy requests.",
  alternates: { canonical: "/privacy" },
};

const sections = [
  ["1. Who operates ARENAGG", "ARENAGG is a community esports tournament platform. The legal name and correspondence address of its operator must be published here before commercial launch. For privacy questions or grievances, use the Privacy Request page or contact 7330804540. We will not invent or publish an unverified legal identity or address."],
  ["2. Information we collect (minimal data)", "For tournament registration, ARENAGG asks for a mobile/contact number and in-game UID, along with basic tournament/team details needed to organise participation. We do not ask players to provide Aadhaar, PAN, home address, identity documents, passwords, banking credentials or other unnecessary personal details. If you voluntarily submit a payment screenshot or transaction reference for entry-fee verification, we may use that submission only to verify the payment and resolve related issues. Our hosting, security and technical providers may automatically process limited technical logs (such as IP address, device/browser information and timestamps) for service operation and security."],
  ["3. Purposes and lawful basis", "We use personal data for tournament registration and administration, communicating tournament updates, checking eligibility and payment submissions, publishing tournament team names and results, preventing fraud and abuse, responding to requests, maintaining security, and complying with legal obligations. Where consent is required, we will request it in a clear way; where another lawful basis applies, we will use data only for that permitted purpose."],
  ["4. Registration notice and consent", "Before you submit registration information, we provide links to these Terms and this Privacy Policy and ask you to affirmatively accept the Terms and acknowledge the Privacy Policy. Acceptance records include the document versions and time. You may withdraw consent where processing is based on consent, but withdrawal may affect our ability to provide registration or tournament services that depend on the information."],
  ["5. Payments and sensitive credentials", "Tournament payments are made using the payment instructions shown for that tournament. We may ask for a payment screenshot or transaction reference solely for manual entry-fee verification. We do not ask for your UPI PIN, banking password, card PIN, OTP, Aadhaar, PAN or identity documents. Never send these credentials or documents to us."],
  ["6. Sharing and service providers", "We do not sell or rent players’ personal information. Contact numbers and payment-verification submissions are accessible only to authorised organisers who need them for tournament administration, verification or support, and are not intended to be shown publicly. We use technical service providers for hosting, database/storage and security; limited technical information may be processed by them to provide those services. We may disclose information where required by law or reasonably necessary to protect users, investigate abuse, enforce tournament rules or resolve disputes."],
  ["7. Public tournament information", "Team names, tournament participation, standings and results may be displayed publicly. Do not enter phone numbers, email addresses, passwords, payment credentials or other private information into team names or public fields. Payment proofs and captain contact details are not intended for public display."],
  ["8. Security and data leakage", "We take reasonable technical and organisational steps to protect the limited information we collect, including access restrictions and careful handling of contact numbers and payment-verification material. We do not intentionally publish or share players’ phone numbers or payment details. We work to prevent unauthorised access or disclosure, but no internet service can honestly guarantee that a data breach or leakage will never occur. If an incident occurs, we will investigate, mitigate and notify/report as required by applicable law."],
  ["9. Retention", "We keep information only for as long as reasonably necessary for the stated purposes, tournament administration, payment/accounting records, security, dispute resolution and legal obligations. Retention depends on the type of information and applicable requirements. When data is no longer needed, we aim to delete it or irreversibly anonymise it, subject to legal holds and backup-cycle limitations. We do not promise immediate deletion from backups."],
  ["10. Your privacy requests", "You may request information about processing, correction of inaccurate data, deletion where applicable, withdrawal of consent, or raise a privacy grievance. Use our Privacy Request form. We may ask for reasonable verification to protect your information and will explain if we cannot fulfil a request because of a legal obligation or legitimate retention need."],
  ["11. Children and guardian involvement", "ARENAGG tournaments may have age-specific eligibility rules. If a participant is under 18, a parent or legal guardian must review the applicable tournament rules and approve participation before personal information is submitted. Our current public registration workflow does not independently verify guardian identity or electronically capture a separate guardian approval; do not treat the checkbox as proof of that verification. A parent or guardian may submit a privacy request on behalf of a child, subject to verification."],
  ["12. Third-party links", "Links to WhatsApp, game publishers, payment applications or other external services are provided for convenience. Those services have separate privacy practices and terms. Review them before sharing information."],
  ["13. Changes and effective date", "We may revise this notice as the platform, data practices or legal requirements change. We will publish the updated version and effective date and provide additional notice where required."],
  ["14. Contact and grievance", "For privacy requests or complaints, use /privacy-request or call 7330804540. Please do not include passwords, OTPs, UPI PINs, card details or government ID numbers in messages. The operator's formal legal identity, address and designated grievance contact must be added before launch."],
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-8 sm:py-16">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">ARENAGG · Legal</p>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">Privacy Policy</h1>
      <p className="mt-4 text-sm text-slate-400">Version 1.1 · Effective 22 November 2026 · Last updated 22 November 2026</p>
      <div className="mt-8 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.04] p-5 text-sm leading-7 text-slate-300">
        This notice describes personal information ARENAGG may collect, the purposes for which it is used, who may handle it, how long it may be retained, and how you can contact us to exercise privacy choices.
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
        This notice is written to support privacy transparency and prepare for applicable Indian data-protection requirements, including the DPDP Act, 2023 and Rules, 2025. It is not a certification of legal compliance. Actual data flows, provider contracts, retention, security controls, guardian consent and the operator/grievance details must be verified and reviewed by qualified Indian counsel.
      </p>
      <Link href="/privacy-request" className="mt-5 inline-flex font-semibold text-cyan-300 hover:text-white">Submit a Privacy Request →</Link>
      <Link href="/terms" className="mt-5 inline-flex font-semibold text-cyan-300 hover:text-white">Read the Terms & Conditions →</Link>
    </main>
  );
}
