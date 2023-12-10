"use client";

import { useState } from "react";
import Image from "next/image";
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
import { Organization } from "@/server/db/schema";

type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverTrigger
>;

interface OrganizationSwitcherProps extends PopoverTriggerProps {
  organizations: Organization[];
}

export const OrganizationSwitcher = ({
  className,
  organizations = [],
}: OrganizationSwitcherProps) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);

  // const formattedOrganizations = organizations.map((organization) => ({
  //   name: organization.name,
  //   id: organization.id,
  // }));

  const currentOrganization = organizations.find(
    (organization) => organization.id === params.organizationId
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
          className={cn(
            "w-[200px] justify-between gap-x-2 border-0 pl-0 pr-1.5",
            className
          )}
        >
          <Image
            src={currentOrganization?.imageUrl!}
            alt="Current organization image"
            width={37}
            height={37}
            className="rounded-md object-contain object-center pl-0"
          />

          {currentOrganization?.name}
          <ChevronsUpDown className="ml-auto h-5 w-5 shrink-0 opacity-30" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[300px] rounded-xl border-0 p-2 shadow-md"
        align="end"
      >
        <Command>
          <CommandList>
            <CommandInput placeholder="Search organization..." />
            <CommandEmpty>No organization found.</CommandEmpty>
            <CommandGroup heading="Organizations">
              {organizations.map((organization) => (
                <CommandItem
                  key={organization.id}
                  onSelect={() => onOrganizationSelect(organization)}
                  className="cursor-pointer text-sm"
                >
                  <Image
                    src={currentOrganization?.imageUrl!}
                    alt="Current organization image"
                    width={37}
                    height={37}
                    className="mr-1.5 rounded-md object-contain object-center"
                  />

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
                className="cursor-pointer text-sm"
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
