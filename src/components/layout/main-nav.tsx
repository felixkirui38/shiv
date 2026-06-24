"use client";

import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { useSiteNavigation } from "@/components/providers/navigation-provider";
import { ProductsMegaMenu } from "@/components/layout/products-mega-menu";
import { NavDropdownMenu } from "@/components/layout/nav-dropdown-menu";

export function MainNav() {
  const { header } = useSiteNavigation();

  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-0.5">
        <ProductsMegaMenu />
        <NavDropdownMenu label="Claims" items={header.claims} />
        <NavDropdownMenu label="About" items={header.about} width="sm" />
        <NavDropdownMenu label="Blog" items={header.blog} width="sm" />
        <NavDropdownMenu label="Contact" items={header.contact} />
      </NavigationMenuList>
    </NavigationMenu>
  );
}
