export const staticPageDefaults: Record<
  string,
  { title: string; description: string; content: string }
> = {
  about: {
    title: "About Shiv Insurance",
    description:
      "Learn about Shiv Insurance Brokers — licensed IRA insurance advisors with 25+ years of trusted service in Kenya.",
    content: `
      <p>Shiv Insurance has been protecting individuals and businesses for over 25 years. We combine traditional insurance expertise with modern technology to deliver seamless coverage, fast claims processing, and exceptional customer service.</p>
      <section id="why-us">
        <h2>Why choose us</h2>
        <ul>
          <li><strong>Licensed & regulated</strong> — IRA-approved brokers with deep market knowledge.</li>
          <li><strong>Fast claims support</strong> — Dedicated team to guide you from filing to settlement.</li>
          <li><strong>Digital-first experience</strong> — Quote, buy, renew, and manage policies online.</li>
          <li><strong>Trusted partners</strong> — Access to leading underwriters across motor, health, life, and business lines.</li>
        </ul>
      </section>
      <section>
        <h2>Our mission</h2>
        <p>To make quality insurance accessible, transparent, and simple for every Kenyan family and business.</p>
      </section>
    `,
  },
  privacy: {
    title: "Privacy Policy",
    description: "Shiv Insurance Brokers privacy policy and data protection practices.",
    content: `
      <p>Shiv Insurance Brokers ("we", "us") respects your privacy. This policy explains how we collect, use, and protect your personal information when you use our website and services.</p>
      <h2>Information we collect</h2>
      <p>We may collect contact details, identification documents, policy information, payment records, and usage data when you request quotes, purchase cover, or contact us.</p>
      <h2>How we use your data</h2>
      <p>Your data is used to provide insurance services, process applications and claims, comply with regulatory requirements, and improve our products.</p>
      <h2>Data protection</h2>
      <p>We implement appropriate technical and organisational measures to safeguard your information. We do not sell your personal data to third parties.</p>
      <h2>Your rights</h2>
      <p>You may request access, correction, or deletion of your personal data by contacting us at <a href="mailto:privacy@shivinsurance.co.ke">privacy@shivinsurance.co.ke</a>.</p>
      <p><em>Last updated: June 2026</em></p>
    `,
  },
  terms: {
    title: "Terms of Service",
    description: "Terms and conditions for using Shiv Insurance Brokers services.",
    content: `
      <p>By using the Shiv Insurance website and portal, you agree to these terms. Please read them carefully.</p>
      <h2>Services</h2>
      <p>We act as insurance brokers. Policies are underwritten by licensed insurers. Coverage is subject to policy wording, exclusions, and insurer approval.</p>
      <h2>Quotes & applications</h2>
      <p>Online quotes are estimates until confirmed by the insurer. You must provide accurate information; misrepresentation may void cover.</p>
      <h2>Payments</h2>
      <p>Premiums are payable as agreed at checkout. Failed or reversed payments may suspend or cancel cover.</p>
      <h2>Liability</h2>
      <p>We are not liable for indirect losses arising from use of this site, except where prohibited by law.</p>
      <h2>Contact</h2>
      <p>Questions about these terms: <a href="/contact">contact us</a> or email <a href="mailto:support@shivinsurance.co.ke">support@shivinsurance.co.ke</a>.</p>
    `,
  },
  claims: {
    title: "Claims Process",
    description: "How to file and track your insurance claim with Shiv Insurance.",
    content: `
      <p>We're here to help when you need to make a claim. Follow the steps below or sign in to your portal to file online.</p>
      <h2>Step 1 — Notify us promptly</h2>
      <p>Report the incident as soon as possible. For motor claims, obtain a police abstract where required.</p>
      <h2>Step 2 — Gather documents</h2>
      <p>Typical documents include your policy number, ID, photos, repair estimates, medical reports, or police reports depending on the claim type.</p>
      <h2>Step 3 — Submit your claim</h2>
      <p><a href="/portal/claims/new">File a claim in the customer portal</a> or call our claims desk during business hours.</p>
      <h2>Step 4 — Track progress</h2>
      <p>Monitor status updates in <a href="/portal/claims">My Claims</a>. Our team may request additional information during assessment.</p>
      <h2>Emergency assistance</h2>
      <p>For urgent motor breakdown or medical emergencies, refer to the 24/7 numbers on your policy schedule.</p>
    `,
  },
};
