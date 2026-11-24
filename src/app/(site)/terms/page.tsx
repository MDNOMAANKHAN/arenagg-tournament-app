import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms governing ARENAGG website use, community esports tournaments, registrations, payments and participation.",
  alternates: { canonical: "/terms" },
};

const sections = [
  ["1. About ARENAGG and operator details", "ARENAGG is an independent community esports platform that publishes tournaments, registration information and results. It is not the developer, owner, sponsor or official representative of Free Fire MAX, BGMI, Valorant or their publishers unless a specific written announcement says otherwise. The operator's legal name and correspondence address must be published on this page before commercial launch."],
  ["2. Acceptance and eligibility", "By using the site or submitting a tournament registration, you agree to these Terms and the tournament-specific rules. You must provide accurate information and meet the eligibility requirements shown for the event and applicable law. If you are under 18, a parent or legal guardian must review these Terms and the event rules and approve your participation. ARENAGG's current registration checkbox does not independently verify a guardian's identity or capture a separate guardian approval."],
  ["3. Registration and capacity", "Submitting a registration is a request, not a guarantee of a slot. A registration is subject to available capacity, eligibility, accurate team/player information, tournament rules and any payment verification. Organisers may reject incomplete, duplicate, fraudulent or ineligible entries. Do not submit another person's information without their permission and any required guardian authority."],
  ["4. Tournament rules and fair play", "Participants must follow the event rules, game publisher rules, organiser instructions and applicable law. Cheating, hacks, unauthorised software, impersonation, collusion, harassment, match/result manipulation, abusive conduct or attempts to disrupt the site or event may result in removal, disqualification, cancellation of a slot or other proportionate action. We may review reports and evidence before making a decision."],
  ["5. Fees, payment verification and refunds", "Any entry fee, payment method, deadline and prize information must be displayed on the tournament page. Paid registration requires a UPI transaction reference (UTR) submitted with the form. ARENAGG does not request payment screenshots in the current registration flow. A UTR is not confirmation until the organiser verifies the payment and approves the registration. Once a paid registration is approved/confirmed, the entry fee is generally non-refundable for a participant's change of mind, inability to attend, late arrival, disqualification or failure to follow event rules. Exceptions include tournament cancellation by ARENAGG, duplicate or mistaken payments, material failure to provide the announced event, or any refund required by applicable law. If an event is cancelled or materially changed, we will communicate the available resolution, including a refund where applicable. This policy does not limit statutory consumer rights."],
  ["6. Prizes and results", "Prize details, eligibility, scoring, tie-breaks, distribution process and any required verification should be stated in the tournament announcement. Results may be reviewed before publication. Prize distribution may require reasonable confirmation of eligibility and payment details. We will communicate material prize-related changes; no prize is guaranteed unless the event announcement confirms it and the participant meets the conditions."],
  ["7. Schedule changes and cancellation", "Organisers may reschedule, change format or cancel an event for technical issues, safety, suspected misconduct, insufficient participation, publisher/platform restrictions or circumstances beyond reasonable control. We will make reasonable efforts to announce material changes through available channels. Fees and prize arrangements for a cancellation will be handled under the event notice and applicable law."],
  ["8. Acceptable website use", "Do not misuse the platform, attempt unauthorised access, interfere with availability, bypass security or rate limits, upload malicious content, scrape or abuse contact/registration systems, impersonate others or use the service unlawfully. We may restrict access to protect the platform and users."],
  ["9. Third-party services and intellectual property", "The site may link to third-party payment, messaging, hosting, game or social services. Their services are governed by their own terms and policies. ARENAGG branding and site content are protected to the extent permitted by law. Game names, logos and assets belong to their respective owners and are used to identify the games or events; ARENAGG claims no ownership of them."],
  ["10. Availability and liability", "We aim to keep information accurate and the service available, but cannot guarantee uninterrupted or error-free operation. To the extent permitted by applicable law, ARENAGG is not liable for indirect loss arising from third-party services, connectivity, outages or events outside reasonable control. Nothing in these Terms excludes or restricts rights, remedies or liability that cannot lawfully be excluded, including consumer rights."],
  ["11. Privacy", "Information is handled as explained in the Privacy Policy. Read it before providing personal data. Privacy requests can be made at /privacy-request."],
  ["12. Complaints and disputes", "Please contact us first through /contact or /privacy-request for privacy matters, or call 7330804540, and provide the tournament name and registration reference where relevant. These Terms are governed by the laws of India, subject to mandatory consumer-protection rights and other applicable law. Disputes are subject to courts/authorities of competent jurisdiction in India; this clause does not remove statutory remedies."],
  ["13. Updates and contact", "We may update these Terms as the platform or legal requirements change. The current version and effective date will appear on this page. The operator's legal name, correspondence address and designated grievance contact must be published before commercial launch."],
];

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-8 sm:py-16">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">ARENAGG · Legal</p>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">Terms & Conditions</h1>
      <p className="mt-4 text-sm text-slate-400">Version 1.3 · Effective 23 November 2026 · Last updated 23 November 2026</p>
      <div className="mt-8 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.04] p-5 text-sm leading-7 text-slate-300">
        Read these Terms before using ARENAGG or registering for a tournament. By checking the acceptance box during registration, you confirm that you accept these Terms and acknowledge the Privacy Policy.
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
        These Terms are a general draft and are not legal advice or a guarantee of compliance. The operator's legal name, correspondence address and designated grievance details still need to be published. Have these Terms, refund rules and the minor-participation process reviewed by a qualified lawyer in India before commercial launch.
      </p>
      <Link href="/privacy" className="mt-5 inline-flex font-semibold text-cyan-300 hover:text-white">Read the Privacy Policy →</Link>
    </main>
  );
}
