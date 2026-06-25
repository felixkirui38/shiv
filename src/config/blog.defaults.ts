export interface DefaultBlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  date: string;
  tags: string[];
  content: string;
  metaTitle?: string;
  metaDescription?: string;
}

export const defaultBlogPosts: DefaultBlogPost[] = [
  {
    slug: "understanding-motor-insurance",
    title: "Understanding Motor Insurance in Kenya",
    excerpt:
      "A comprehensive guide to third-party and comprehensive motor cover, including legal requirements for Kenyan drivers.",
    category: "Motor",
    categorySlug: "motor",
    date: "2026-03-15",
    tags: ["motor", "kenya", "comprehensive"],
    metaTitle: "Understanding Motor Insurance in Kenya | Shiv Insurance",
    metaDescription:
      "Learn the difference between third-party and comprehensive motor insurance in Kenya and what cover you need.",
    content: `
      <p>Motor insurance is mandatory for all vehicles on Kenyan roads. Whether you drive a private car, commercial vehicle, or motorcycle, understanding your options helps you stay compliant and protected.</p>
      <h2>Third-party vs comprehensive</h2>
      <p><strong>Third-party only (TPO)</strong> covers injury or damage you cause to other people and their property. It does not cover damage to your own vehicle.</p>
      <p><strong>Comprehensive cover</strong> includes third-party liability plus protection for your vehicle against accident, theft, fire, and selected natural perils.</p>
      <h2>What affects your premium?</h2>
      <ul>
        <li>Vehicle value and age</li>
        <li>Driver age and experience</li>
        <li>Claims history</li>
        <li>Security features and overnight parking</li>
      </ul>
      <p>Shiv Insurance Brokers compares plans from leading underwriters so you get competitive rates with the right level of cover.</p>
    `,
  },
  {
    slug: "medical-scheme-benefits",
    title: "Choosing the Right Medical Scheme for Your Business",
    excerpt:
      "Key factors to consider when selecting group medical insurance for your employees.",
    category: "Medical",
    categorySlug: "medical",
    date: "2026-03-08",
    tags: ["medical", "business", "group-cover"],
    metaTitle: "Choosing the Right Medical Scheme | Shiv Insurance",
    metaDescription:
      "How to evaluate group medical schemes for your business — benefits, networks, and cost considerations.",
    content: `
      <p>Group medical insurance is one of the most valued employee benefits. The right scheme improves retention, productivity, and peace of mind for your team.</p>
      <h2>Core benefits to compare</h2>
      <ul>
        <li><strong>Inpatient limits</strong> — annual and per-person caps for hospital admissions</li>
        <li><strong>Outpatient cover</strong> — GP visits, diagnostics, and pharmacy</li>
        <li><strong>Maternity</strong> — waiting periods and sub-limits</li>
        <li><strong>Dental & optical</strong> — often optional add-ons</li>
      </ul>
      <h2>Provider network</h2>
      <p>Check that panel hospitals and clinics are accessible near your offices and where employees live. A wider network usually means higher premiums but better convenience.</p>
      <h2>Cost sharing</h2>
      <p>Understand co-payments, room limits, and exclusions for pre-existing conditions. Transparent communication with staff avoids surprises at claim time.</p>
      <p>Our advisors can structure a scheme that balances affordability with meaningful cover for your workforce.</p>
    `,
  },
  {
    slug: "claims-tips",
    title: "5 Tips for a Smooth Insurance Claims Experience",
    excerpt:
      "How to prepare documentation and communicate effectively during the claims process.",
    category: "Claims",
    categorySlug: "claims",
    date: "2026-02-28",
    tags: ["claims", "tips"],
    metaTitle: "5 Insurance Claims Tips | Shiv Insurance",
    metaDescription:
      "Practical tips to speed up your insurance claim — documentation, timelines, and communication.",
    content: `
      <p>Filing a claim can feel stressful. These steps help you move through the process efficiently and improve the chance of a fair, timely settlement.</p>
      <ol>
        <li><strong>Report promptly</strong> — notify your broker or insurer as soon as possible after an incident.</li>
        <li><strong>Document everything</strong> — photos, police abstracts (where required), receipts, and witness details.</li>
        <li><strong>Know your policy</strong> — review limits, excesses, and exclusions before submitting.</li>
        <li><strong>Keep copies</strong> — retain duplicates of all forms and correspondence.</li>
        <li><strong>Stay in touch</strong> — respond quickly to requests for additional information.</li>
      </ol>
      <p>Shiv Insurance's claims team guides you from first notice through to settlement. Use the client portal to track status online.</p>
    `,
  },
];

export function getDefaultBlogPost(slug: string): DefaultBlogPost | undefined {
  return defaultBlogPosts.find((p) => p.slug === slug);
}
