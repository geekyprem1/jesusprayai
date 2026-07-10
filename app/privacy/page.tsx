import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How PrayNote AI handles your account, prayer journal, and Scripture-related data. From the Eternal Faith team.",
};

const UPDATED = "July 10, 2026";

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="We treat your prayers as sacred. This page explains what we collect, how we use it, and how we protect it."
      updated={UPDATED}
    >
      <LegalSection title="1. Who we are">
        <p>
          <strong>PrayNote AI</strong> (“PrayNote,” “we,” “us”) is a private
          Christian prayer journal and Scripture companion, offered as a project
          of the <strong>Eternal Faith</strong> team. This policy applies to the
          PrayNote website and web app.
        </p>
        <p>
          For privacy questions, contact us through the Eternal Faith page
          messaging channels or the support contact listed on the site when
          available.
        </p>
      </LegalSection>

      <LegalSection title="2. What we collect">
        <p>Depending on how you use PrayNote, we may process:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Account data</strong> — email address, password (stored by
            our auth provider as secure hashes, not readable by us as plain
            text), optional display name.
          </li>
          <li>
            <strong>Journal content</strong> — prayer text you write or save,
            categories, answered-prayer notes, prayer requests, bookmarked
            verses, and related timestamps.
          </li>
          <li>
            <strong>Voice data</strong> — if you use server-side transcription
            (Whisper), audio is sent to a speech-to-text provider to produce
            text; we aim not to keep audio longer than needed for that request.
          </li>
          <li>
            <strong>Usage &amp; technical data</strong> — basic logs (e.g. error
            reports), device/browser signals, and optional analytics if enabled
            (page views, feature use). We design analytics to avoid sending full
            prayer bodies.
          </li>
          <li>
            <strong>Reminders</strong> — timezone, preferred reminder time, and
            channel if you enable daily reminders.
          </li>
          <li>
            <strong>Local device data</strong> — drafts or offline journal data
            may be stored in your browser (e.g. localStorage) so the app works
            when offline.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. How we use your data">
        <ul className="list-disc space-y-1 pl-5">
          <li>Provide and improve the journal, Bible tools, and reminders.</li>
          <li>
            Run AI features you request (e.g. prayer categorization, verse
            suggestions, short weekly encouragement) using trusted third-party
            AI providers.
          </li>
          <li>Authenticate you and secure the service (fraud and abuse prevention, rate limits).</li>
          <li>Send optional reminder emails if you turn them on.</li>
          <li>Comply with law and protect the rights and safety of users.</li>
        </ul>
        <p className="mt-2">
          <strong>We do not sell your prayers or personal data.</strong> We do
          not use your prayer text as public social content or advertising
          creative.
        </p>
      </LegalSection>

      <LegalSection title="4. AI and third parties">
        <p>
          When you use AI features, relevant text (for example, a prayer
          excerpt) may be sent to AI providers such as OpenRouter and/or model
          providers they route to, solely to return categories, verse
          references, or short encouragement. Voice features may use OpenAI
          Whisper or similar.
        </p>
        <p>
          We also use infrastructure providers such as{" "}
          <strong>Supabase</strong> (auth and database),{" "}
          <strong>Vercel</strong> (hosting), and optionally email (e.g. Resend)
          and analytics tools. Each processes data under their own terms and
          security practices.
        </p>
        <p>
          Bible passage text may be fetched from third-party Bible APIs (e.g.
          public-domain KJV sources).
        </p>
      </LegalSection>

      <LegalSection title="5. Privacy of prayers (core promise)">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Your journal is a <strong>private journal</strong>, not a public
            feed. Other users cannot browse your prayers through the normal app.
          </li>
          <li>
            Access is controlled by your account and database security rules
            (row-level security) designed so users only see their own rows.
          </li>
          <li>
            Sharing features (e.g. verse cards) share <strong>Scripture
            text</strong> you choose to share — not your full private prayer —
            unless you paste prayer text yourself into a share message.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Cookies and sessions">
        <p>
          We use cookies or similar storage for authentication sessions (so you
          stay logged in) and essential app function. If analytics tools are
          enabled, they may set their own cookies subject to their policies.
        </p>
      </LegalSection>

      <LegalSection title="7. How long we keep data">
        <p>
          We keep account and journal data while your account is active. You may
          delete individual entries in the app. If you want full account deletion,
          contact us and we will process deletion of personal data we control,
          subject to legal retention needs (e.g. security logs for a limited
          time).
        </p>
        <p>
          Offline data on your device remains until you clear browser storage or
          use the app’s clear/logout flows when available.
        </p>
      </LegalSection>

      <LegalSection title="8. Security">
        <p>
          We use industry-standard measures such as HTTPS, authenticated
          sessions, access controls, and rate limits. No method of transmission
          or storage is 100% secure. Please use a strong unique password and do
          not share your account on public devices without signing out.
        </p>
      </LegalSection>

      <LegalSection title="9. Children">
        <p>
          PrayNote is not directed at children under 13 (or the minimum age in
          your country). If you believe a child has provided personal data,
          contact us so we can delete it.
        </p>
      </LegalSection>

      <LegalSection title="10. International users">
        <p>
          We may process data on servers in the United States or other regions
          where our providers operate. If you use PrayNote from another
          country, you consent to transfer and processing in those locations as
          needed to run the service.
        </p>
      </LegalSection>

      <LegalSection title="11. Your choices">
        <ul className="list-disc space-y-1 pl-5">
          <li>Update or delete journal entries and requests in the app.</li>
          <li>Disable reminders in settings.</li>
          <li>Avoid AI features if you do not want prayer text processed by AI providers.</li>
          <li>Sign out on shared devices; clear browser data if needed.</li>
          <li>Request account deletion via support contact.</li>
        </ul>
      </LegalSection>

      <LegalSection title="12. Changes">
        <p>
          We may update this policy. The “Last updated” date will change. Continued
          use after changes means you accept the updated policy for future use.
          Material changes may be highlighted on the site when practical.
        </p>
      </LegalSection>

      <LegalSection title="13. Contact">
        <p>
          Questions about privacy: reach the Eternal Faith / PrayNote team via
          the Facebook page or the support channel listed on the site.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
