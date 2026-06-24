import { getSiteNavigation } from "@/lib/cms/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { JsonLd } from "@/components/seo/json-ld";
import { buildOrganizationJsonLd, buildWebsiteJsonLd, getSeoGlobal } from "@/lib/seo";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [navigation, global] = await Promise.all([
    getSiteNavigation(),
    getSeoGlobal(),
  ]);

  const orgLd = buildOrganizationJsonLd(global.organization);
  const websiteLd = await buildWebsiteJsonLd();

  return (
    <>
      <JsonLd data={[orgLd, websiteLd]} />
      <SiteShell navigation={navigation}>{children}</SiteShell>
    </>
  );
}
