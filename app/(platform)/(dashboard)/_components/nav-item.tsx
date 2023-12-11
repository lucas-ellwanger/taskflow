"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Activity, CreditCard, Layout, Settings } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Workspace } from "@/server/db/schema";

interface NavItemProps {
  isExpanded: boolean;
  isActive: boolean;
  workspace: Workspace;
  onExpand: (id: string) => void;
}

export const NavItem = ({
  isExpanded,
  isActive,
  workspace,
  onExpand,
}: NavItemProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const routes = [
    {
      label: "Boards",
      icon: <Layout className="mr-2 h-4 w-4" />,
      href: `/workspace/${workspace.id}`,
    },
    {
      label: "Activity",
      icon: <Activity className="mr-2 h-4 w-4" />,
      href: `/workspace/${workspace.id}/activity`,
    },
    {
      label: "Settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
      href: `/workspace/${workspace.id}/settings`,
    },
    {
      label: "Billing",
      icon: <CreditCard className="mr-2 h-4 w-4" />,
      href: `/workspace/${workspace.id}/billing`,
    },
  ];

  const onClick = (href: string) => {
    router.push(href);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <AccordionItem value={workspace.id} className="border-none">
      <AccordionTrigger
        onClick={() => onExpand(workspace.id)}
        className={cn(
          "flex items-center gap-x-2 rounded-md p-1.5 text-start text-muted-foreground no-underline transition hover:bg-muted-foreground/10 hover:no-underline",
          isActive && !isExpanded && "bg-sky-500/10 text-sky-700"
        )}
      >
        <div className="flex items-center gap-x-2">
          <div className="relative h-7 w-7">
            <Image
              fill
              src={workspace.imageUrl}
              alt="workspace"
              className="rounded-sm object-cover"
            />
          </div>
          <span className="text-sm font-medium">{workspace.name}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-1 text-muted-foreground">
        {routes.map((route) => (
          <Button
            key={route.href}
            size="sm"
            variant="ghost"
            onClick={() => onClick(route.href)}
            className={cn(
              "mb-1 w-full justify-start pl-10 font-normal",
              pathname === route.href && "bg-sky-500/10 text-sky-700"
            )}
          >
            {route.icon}
            {route.label}
          </Button>
        ))}
      </AccordionContent>
    </AccordionItem>
  );
};
