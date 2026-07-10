import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";
import { BRAND, supportMailto } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms of use for PrayNote AI — account rules, acceptable use, and service terms. From Eternal Faith.",
};

const UPDATED = "July 10, 2026";

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      description="By using PrayNote AI you agree to these terms. Please also read our Privacy Policy and Disclaimer."
      updated={UPDATED}
    >
      <LegalSection title="1. Agreement">
        <p>
          These Terms of Use (“Terms”) govern access to PrayNote AI (the
          “Service”), a prayer journal and Scripture companion from the Eternal
          Faith team. By creating an account or using the Service, you agree to
          these Terms, our{" "}
          <Link href="/privacy" className="text-primary underline-offset-4 hover:underline">
            Privacy Policy
          </Link>
          , and{" "}
          <Link href="/disclaimer" className="text-primary underline-offset-4 hover:underline">
            Disclaimer
          </Link>
          .
        </p>
        <p>
          If you do not agree, do not use the Service.
        </p>
      </LegalSection>

      <LegalSection title="2. Eligibility">
        <p>
          You must be at least 13 years old (or the age of digital consent in
          your country) and able to form a binding agreement. If you use the
          Service on behalf of a church or organization, you represent that you
          have authority to bind that organization.
        </p>
      </LegalSection>

      <LegalSection title="3. Account">
        <ul className="list-disc space-y-1 pl-5">
          <li>Provide accurate account information.</li>
          <li>Keep your password confidential and use a strong password.</li>
          <li>You are responsible for activity under your account.</li>
          <li>
            Notify us if you suspect unauthorized access. Sign out on shared
            devices.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Your content">
        <p>
          You retain ownership of the prayers and notes you create (“Your
          Content”). You grant us a limited license to host, process, back up,
          and display Your Content solely to operate the Service (including AI
          features you use and optional reminders).
        </p>
        <p>
          You represent that you have the right to submit Your Content and that
          it does not violate law or others’ rights.
        </p>
      </LegalSection>

      <LegalSection title="5. Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Abuse, spam, or overload the Service, AI, voice, or APIs.</li>
          <li>Attempt to access other users’ private data.</li>
          <li>Bypass rate limits, security controls, or payment systems.</li>
          <li>
            Upload malware or attempt to reverse engineer the Service except as
            allowed by law.
          </li>
          <li>
            Use the Service for illegal activity, harassment, or content that
            is unlawful in your jurisdiction.
          </li>
          <li>
            Scrape the Service at scale or resell access without permission.
          </li>
        </ul>
        <p>
          We may suspend or terminate accounts that violate these Terms or harm
          the Service or other users.
        </p>
      </LegalSection>

      <LegalSection title="6. AI features">
        <p>
          AI suggestions are optional helpers. They are not pastoral authority.
          Usage may be limited per day or plan. We may change models, limits, or
          availability. See the{" "}
          <Link href="/disclaimer" className="text-primary underline-offset-4 hover:underline">
            Disclaimer
          </Link>{" "}
          for AI and Scripture limitations.
        </p>
      </LegalSection>

      <LegalSection title="7. Free tier and paid plans">
        <p>
          Free access may include usage limits. Paid plans, if offered, will be
          described on the pricing page. Prices and features may change with
          notice when practical. Refunds, if any, follow the payment provider’s
          rules when payments go live.
        </p>
      </LegalSection>

      <LegalSection title="8. Intellectual property">
        <p>
          The Service branding, design, software, and original materials (excluding
          Your Content and third-party Bible text) are owned by us or our
          licensors. You may not copy or redistribute the Service as a product
          without permission.
        </p>
        <p>
          Bible translations remain subject to their respective copyright and
          license terms.
        </p>
      </LegalSection>

      <LegalSection title="9. Termination">
        <p>
          You may stop using the Service at any time. We may suspend or end
          access if you breach these Terms, if required by law, or if we
          discontinue the Service. Provisions that should survive (liability,
          IP, disclaimers) will survive termination.
        </p>
      </LegalSection>

      <LegalSection title="10. Disclaimers and liability">
        <p>
          The Service is provided “as is.” Disclaimers and liability limits in
          our{" "}
          <Link href="/disclaimer" className="text-primary underline-offset-4 hover:underline">
            Disclaimer
          </Link>{" "}
          are incorporated into these Terms.
        </p>
      </LegalSection>

      <LegalSection title="11. Changes to the Terms">
        <p>
          We may update these Terms. The “Last updated” date will change.
          Continued use after changes constitutes acceptance of the new Terms
          for ongoing use. If you disagree, stop using the Service.
        </p>
      </LegalSection>

      <LegalSection title="12. Governing law">
        <p>
          These Terms are governed by the laws applicable in the operator’s
          primary place of business, without regard to conflict-of-law rules,
          unless mandatory consumer laws in your country provide otherwise.
        </p>
      </LegalSection>

      <LegalSection title="13. Contact">
        <p>
          Questions about these Terms: email the Eternal Faith / PrayNote team
          at{" "}
          <a
            href={supportMailto}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {BRAND.supportEmail}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
