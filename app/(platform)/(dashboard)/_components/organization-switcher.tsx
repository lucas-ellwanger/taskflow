"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Check,
  ChevronsUpDown,
  LayoutDashboard,
  PlusCircle,
} from "lucide-react";

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
import { Organization, organization } from "@/server/db/schema";

type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverTrigger
>;

interface OrganizationSwitcherProps extends PopoverTriggerProps {
  items: Organization[];
}

export const OrganizationSwitcher = ({
  className,
  items = [],
}: OrganizationSwitcherProps) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const formattedItems = items.map((item) => ({
    name: item.name,
    id: item.id,
  }));

  const currentOrganization = formattedItems.find(
    (item) => item.id === params.organizationId
  );

  const onOrganizationSelect = (organization: { id: string; name: string }) => {
    setOpen(false);
    router.push(`/organization/${organization.id}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          aria-label="Select organization"
          className={cn("w-[200px] justify-between", className)}
        >
          <LayoutDashboard className="mr-2 h-5 w-5" />
          {currentOrganization?.name}
          <ChevronsUpDown className="ml-auto h-5 w-5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandInput placeholder="Search organization..." />
            <CommandEmpty>No organization found.</CommandEmpty>
            <CommandGroup heading="Organizations">
              {formattedItems.map((organization) => (
                <CommandItem
                  key={organization.id}
                  onSelect={() => onOrganizationSelect(organization)}
                  className="text-sm"
                >
                  <LayoutDashboard className="mr-2 h-5 w-5" />
                  {organization.name}
                  <Check
                    className={cn(
                      "ml-auto h-5 w-5",
                      currentOrganization?.id === organization.id
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
                  // TODO: organizationModal.onOpen()
                }}
                className="text-sm"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Create organization
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
