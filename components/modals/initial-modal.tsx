"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/image-upload";
import { api } from "@/trpc/react";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required.",
  }),
  imageUrl: z.string().min(1, {
    message: "Image is required.",
  }),
});

export const InitialModal = () => {
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
    },
  });

  const { mutate: createWorkspace, isLoading } =
    api.workspace.create.useMutation({
      onSuccess: () => {
        form.reset();
        window.location.reload();
      },
    });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { name, imageUrl } = values;

    createWorkspace({ name, imageUrl });
  };

  if (!isMounted) return null;

  return (
    <Dialog open>
      <DialogContent className="overflow-hidden bg-background p-0 text-foreground">
        <DialogHeader className="px-6 pt-8">
          <DialogTitle className="text-center text-2xl font-semibold">
            Create your first Workspace
          </DialogTitle>
          <DialogDescription className="text-center text-base text-muted-foreground">
            Give a name and an image to your Workspace. <br />
            You can always change it later.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <div className="flex items-center justify-center text-center">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ImageUpload
                          onChange={field.onChange}
                          value={field.value}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-muted-foreground dark:text-secondary/70">
                      Workspace name
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="border-0 bg-zinc-300/50 text-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                        placeholder="Enter Workspace name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-4">
              <Button variant="primary" disabled={isLoading}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
