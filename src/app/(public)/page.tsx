import { getWebsiteLayout } from "@/lib/cms/homepage";
import { getActiveProducts } from "@/lib/products/queries";
import { mergeCatalogIntoHomepage } from "@/lib/products/catalog";
import { buildPageMetadata } from "@/lib/seo";
import { HomepageProvider } from "@/components/providers/homepage-provider";
import { HomepageSections } from "@/components/homepage/homepage-sections";

export async function generateMetadata() {
  return buildPageMetadata("/");
}

export default async function HomePage() {
  const [website, catalog] = await Promise.all([
    getWebsiteLayout(),
    getActiveProducts(),
  ]);

  const mergedContent = mergeCatalogIntoHomepage(website.homepage, catalog);

  return (
    <HomepageProvider
      content={mergedContent}
      sectionOrder={website.sectionOrder}
      sectionVisibility={website.sectionVisibility}
    >
      <HomepageSections />
    </HomepageProvider>
  );
}
