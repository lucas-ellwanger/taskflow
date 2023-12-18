"use client";

import { type RefObject } from "react";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";

import { BoardPicker } from "./board-picker";

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  image: z.string().min(1, { message: "Please select an image" }),
});

interface BoardFormProps {
  closeRef: RefObject<HTMLButtonElement>;
}

export const BoardForm = ({ closeRef }: BoardFormProps) => {
  const router = useRouter();
  const utils = api.useUtils();
  const params = useParams();

  const workspaceId = params.workspaceId as string;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      image: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const { mutate: createBoard, isLoading } = api.board.createBoard.useMutation({
    onSuccess: ({ createdBoard }) => {
      // await utils.board.getBoards.invalidate();
      toast.success("Board created!");
      closeRef.current?.click();
      router.push(`/workspace/${workspaceId}/board/${createdBoard.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createBoard({
      ...values,
      workspaceId,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Board image</FormLabel>
              <FormControl>
                <BoardPicker
                  value={field.value}
                  isSubmitting={isSubmitting}
                  onChange={(image) => field.onChange(image)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Board title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          variant="primary"
          type="submit"
          className="mt-4 w-full"
          disabled={isLoading}
        >
          Create
        </Button>
      </form>
    </Form>
  );
};
