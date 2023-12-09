import { UserButton } from "@clerk/nextjs";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 z-50 flex h-14 w-full items-center border-b bg-background px-4 shadow-sm">
      {/* TODO: Mobile Sidebar */}
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
        <div>{/* TODO: Organization Switcher */}</div>
        <UserButton afterSignOutUrl="/" />
      </div>
    </nav>
  );
};
