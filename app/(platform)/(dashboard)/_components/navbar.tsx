import { UserButton } from "@clerk/nextjs";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { api } from "@/trpc/server";

import { MobileSidebar } from "./mobile-sidebar";
import { OrganizationSwitcher } from "./organization-switcher";

export const Navbar = async () => {
  const organizations = await api.organization.getUserMemberships.query();

  return (
    <nav className="fixed top-0 z-50 flex h-14 w-full items-center border-b bg-background px-4 shadow-sm">
      <MobileSidebar />
      <div className="flex items-center gap-x-4">
        <div className="hidden md:flex">
          <Logo />
        </div>
        <Button
          variant="primary"
          size="sm"
          className="hidden h-auto rounded-sm px-2 py-1.5 md:block"
        >
          Create
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="block rounded-sm md:hidden"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="ml-auto flex items-center gap-x-2">
        <OrganizationSwitcher items={organizations} />
        <UserButton afterSignOutUrl="/" />
      </div>
    </nav>
  );
};
