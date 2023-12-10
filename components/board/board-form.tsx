"use client";

import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { StringValidation, z } from "zod";

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

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
});

export const BoardForm = () => {
  const router = useRouter();
  const utils = api.useUtils();
  const params = useParams();

  const orgId = params.organizationId as string;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  const { mutate: createBoard, isLoading } = api.board.createBoard.useMutation({
    onSuccess: () => {
      utils.board.invalidate();
      toast.success("Board created!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    createBoard({
      ...values,
      organizationId: orgId,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
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
