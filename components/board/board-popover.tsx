"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BoardForm } from "@/components/board/board-form";

interface BoardPopoverProps {
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

export const BoardPopover = ({
  children,
  side = "bottom",
  align,
  sideOffset = 0,
}: BoardPopoverProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align={align}
        className="w-80 pt-3"
        side={side}
        sideOffset={sideOffset}
      >
        <div className="pb-4 text-center text-sm font-medium text-neutral-700">
          Create board
        </div>
        <PopoverClose asChild>
          <Button
            className="absolute right-2 top-2 h-auto w-auto p-2 text-neutral-700"
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        </PopoverClose>
        <BoardForm />
      </PopoverContent>
    </Popover>
  );
};
