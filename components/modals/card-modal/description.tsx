"use client";

import { ElementRef, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlignLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useEventListener, useOnClickOutside } from "usehooks-ts";
import * as z from "zod";

import { CardWithList } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";

interface DescriptionProps {
  data: CardWithList;
}

const formSchema = z.object({
  description: z.string(),
});

export const Description = ({ data }: DescriptionProps) => {
  const params = useParams();
  const utils = api.useUtils();

  const [isEditing, setIsEditing] = useState(false);

  const formRef = useRef<ElementRef<"form">>(null);
  const textareaRef = useRef<ElementRef<"textarea">>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: data.description || "",
    },
  });

  const { mutate: updateCard, isLoading } =
    api.card.updateDescription.useMutation({
      onSuccess: ({ data }) => {
        utils.card.getCard.invalidate({
          cardId: data.id,
        });

        utils.auditLog.getLatestAuditLogs.invalidate({
          workspaceId: params.workspaceId as string,
          entityId: data.id,
          entityType: "CARD",
        });

        toast.success(`Card "${data.title}" updated!`);

        disableEditing();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      textareaRef.current?.focus();
    });
  };

  const disableEditing = () => {
    setIsEditing(false);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      disableEditing();
    }
  };

  useEventListener("keydown", onKeyDown);
  useOnClickOutside(formRef, disableEditing);

  const onSubmit = ({ description }: z.infer<typeof formSchema>) => {
    const boardId = params.boardId as string;
    const workspaceId = params.workspaceId as string;

    updateCard({
      id: data.id,
      title: data.title,
      description,
      boardId,
      workspaceId,
    });
  };

  return (
    <div className="flex w-full items-start gap-x-3">
      <AlignLeft className="mt-0.5 h-5 w-5 text-foreground" />
      <div className="w-full">
        <p className="mb-2 font-semibold text-foreground">Description</p>
        {isEditing ? (
          <Form {...form}>
            <form
              ref={formRef}
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-2"
            >
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        ref={textareaRef}
                        id="description"
                        defaultValue={data.description || undefined}
                        placeholder="Add a more detailed description..."
                        className="mb-3 mt-2 w-full resize-none outline-none ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex items-center gap-x-2">
                <Button variant="primary" type="submit" size="sm">
                  Save
                </Button>
                <Button
                  variant="ghost"
                  onClick={disableEditing}
                  type="reset"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div
            onClick={enableEditing}
            role="button"
            className="min-h-[78px] rounded-md bg-neutral-200 px-3.5 py-3 text-sm font-medium hover:bg-neutral-300"
          >
            {data.description || "Add a more detailed description..."}
          </div>
        )}
      </div>
    </div>
  );
};

Description.Skeleton = function DescriptionSkeleton() {
  return (
    <div className="flex w-full items-start gap-x-3">
      <Skeleton className="h-6 w-6 bg-neutral-200" />
      <div className="w-full">
        <Skeleton className="mb-2 h-6 w-24 bg-neutral-200" />
        <Skeleton className="h-[78px] w-full bg-neutral-200" />
      </div>
    </div>
  );
};
