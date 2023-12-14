"use client";

import { ElementRef, forwardRef, KeyboardEventHandler, useRef } from "react";
import { useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useEventListener, useOnClickOutside } from "usehooks-ts";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface CardFormProps {
  listId: number;
  isEditing: boolean;
  enableEditing: () => void;
  disableEditing: () => void;
}

const formSchema = z.object({
  title: z.string().min(2, { message: "Title is required" }),
});

export const CardForm = forwardRef<HTMLTextAreaElement, CardFormProps>(
  ({ listId, isEditing, enableEditing, disableEditing }, ref) => {
    const params = useParams();
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

    // const { mutate: createBoard, isLoading } = api.board.createBoard.useMutation({
    //   onSuccess: ({ createdBoard }) => {
    //     // await utils.board.getBoards.invalidate();
    //     toast.success("Board created!");
    //     closeRef.current?.click();
    //     router.push(`/workspace/${workspaceId}/board/${createdBoard.id}`);
    //   },
    //   onError: (error) => {
    //     toast.error(error.message);
    //   },
    // });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
      console.log(values);
      // createBoard({
      //   ...values,
      //   workspaceId,
      // });
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
                  <FormMessage />
                </FormItem>
              )}
            />
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
