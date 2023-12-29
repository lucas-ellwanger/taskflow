"use client";

import {
  forwardRef,
  useRef,
  type ElementRef,
  type KeyboardEventHandler,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useEventListener, useOnClickOutside } from "usehooks-ts";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";

interface CardFormProps {
  listId: string;
  isEditing: boolean;
  enableEditing: () => void;
  disableEditing: () => void;
}

const formSchema = z.object({
  title: z.string(),
});

export const CardForm = forwardRef<HTMLTextAreaElement, CardFormProps>(
  ({ listId, isEditing, enableEditing, disableEditing }, ref) => {
    const params = useParams();
    const router = useRouter();
    const formRef = useRef<ElementRef<"form">>(null);

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        title: "",
      },
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        disableEditing();
      }
    };

    useOnClickOutside(formRef, disableEditing);
    useEventListener("keydown", onKeyDown);

    const onTextareaKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (
      e
    ) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };

    const { mutate: createCard, isLoading } = api.card.createCard.useMutation({
      onSuccess: ({ data }) => {
        disableEditing();
        form.reset();
        router.refresh();
        toast.success(`Card "${data.title}" created`);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

    const onSubmit = ({ title }: z.infer<typeof formSchema>) => {
      const boardId = params.boardId as string;
      const workspaceId = params.workspaceId as string;

      if (title.trim().length === 0) {
        return disableEditing(), form.reset();
      }

      createCard({
        title,
        listId,
        boardId,
        workspaceId,
      });
    };

    if (isEditing) {
      return (
        <Form {...form}>
          <form
            ref={formRef}
            onSubmit={form.handleSubmit(onSubmit)}
            className="m-1 space-y-4 px-1 py-0.5"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      ref={ref}
                      onKeyDown={onTextareaKeyDown}
                      disabled={form.formState.isSubmitting}
                      placeholder="Enter a title for this card..."
                      className="resize-none shadow-sm outline-none ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-1">
              <Button
                disabled={isLoading}
                type="submit"
                size="sm"
                variant="primary"
              >
                Add card
              </Button>
              <Button
                onClick={disableEditing}
                type="reset"
                size="sm"
                variant="ghost"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </Form>
      );
    }

    return (
      <div className="px-2 pt-2">
        <Button
          onClick={enableEditing}
          className="h-auto w-full justify-start px-2 py-1.5 text-sm text-muted-foreground"
          size="sm"
          variant="ghost"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add a card
        </Button>
      </div>
    );
  }
);

CardForm.displayName = "CardForm";
