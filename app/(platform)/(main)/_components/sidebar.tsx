"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";
import { useLocalStorage } from "usehooks-ts";

import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Workspace } from "@/server/db/schema";

import { NavItem } from "./nav-item";

interface SidebarProps {
  storageKey?: string;
  workspaces: Workspace[];
}

export const Sidebar = ({
  storageKey = "t-sidebar-state",
  workspaces,
}: SidebarProps) => {
  const { workspaceId } = useParams();

  const [expanded, setExpanded] = useLocalStorage<Record<string, any>>(
    storageKey,
    {}
  );

  const defaultAccordionValue: string[] = Object.keys(expanded).reduce(
    (acc: string[], key: string) => {
      if (expanded[key]) {
        acc.push(key);
      }
      return acc;
    },
    []
  );

  const onExpand = (id: string) => {
    setExpanded((curr) => ({ ...curr, [id]: !expanded[id] }));
  };

  return (
    <>
      <div className="mb-1 flex items-center text-xs font-medium">
        <span className="pl-4">Workspaces</span>
        <Button
          asChild
          type="button"
          size="icon"
          variant="ghost"
          className="ml-auto"
        >
          <Link href="/select-workspace">
            <Plus className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <Accordion
        type="multiple"
        defaultValue={defaultAccordionValue}
        className="space-y-2"
      >
        {workspaces?.map((workspace) => (
          <NavItem
            key={workspace.id}
            isActive={workspaceId === workspace.id}
            isExpanded={expanded[workspace.id]}
            workspace={workspace}
            onExpand={onExpand}
          />
        ))}
      </Accordion>
    </>
  );
};
