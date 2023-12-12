"use client";

import { useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Workspace } from "@/server/db/schema";

type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverTrigger
>;

interface WorkspaceSwitcherProps extends PopoverTriggerProps {
  workspaces: Workspace[];
}

export const WorkspaceSwitcher = ({
  className,
  workspaces = [],
}: WorkspaceSwitcherProps) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);

  let currentWorkspace: Workspace | undefined;

  if (!params.workspaceId) {
    currentWorkspace = workspaces[0];
  } else {
    currentWorkspace = workspaces.find(
      (workspace) => workspace.id === params.workspaceId
    );
  }

  const onWorkspaceSelect = (workspace: { id: string; name: string }) => {
    setOpen(false);
    router.push(`/workspace/${workspace.id}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          aria-label="Select workspace"
          className={cn(
            "w-[170px] justify-between gap-x-2 border-0 pl-0 pr-1.5",
            className
          )}
        >
          <div className="relative h-9 w-9">
            <Image
              fill
              src={currentWorkspace?.imageUrl!}
              alt="Current workspace image"
              className="rounded-md object-cover object-center pl-0"
            />
          </div>

          {currentWorkspace?.name}
          <ChevronsUpDown className="ml-auto h-5 w-5 shrink-0 opacity-30" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[300px] rounded-xl border-0 p-2 shadow-md"
        align="end"
      >
        <Command>
          <CommandList>
            <CommandInput placeholder="Search workspace..." />
            <CommandEmpty>No workspace found.</CommandEmpty>
            <CommandGroup heading="Workspaces">
              {workspaces.map((workspace) => (
                <CommandItem
                  key={workspace.id}
                  onSelect={() => onWorkspaceSelect(workspace)}
                  className="cursor-pointer text-sm"
                >
                  <div className="relative mr-1.5 h-9 w-9">
                    <Image
                      fill
                      src={currentWorkspace?.imageUrl!}
                      alt="Current workspace image"
                      className="rounded-md object-cover object-center"
                    />
                  </div>
                  {workspace.name}
                  <Check
                    className={cn(
                      "ml-auto h-5 w-5",
                      currentWorkspace?.id === workspace.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <CommandList>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  // TODO: workspaceModal.onOpen()
                }}
                className="cursor-pointer text-sm"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Create Workspace
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
