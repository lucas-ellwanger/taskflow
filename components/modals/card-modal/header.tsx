"use client";

import { ElementRef, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Layout } from "lucide-react";
import { toast } from "sonner";

import { CardWithList } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

interface HeaderProps {
  data: CardWithList;
}

export const Header = ({ data }: HeaderProps) => {
  const params = useParams();
  const router = useRouter();

  const inputRef = useRef<ElementRef<"input">>(null);

  const [title, setTitle] = useState(data.title);

  const { mutate: updateCard, isLoading } = api.card.updateTitle.useMutation({
    onSuccess: ({ data }) => {
      router.refresh();
      setTitle(data.title);
      toast.success(`Card "${data.title}" updated!`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (formData: FormData) => {
    const title = formData.get("title") as string;
    const boardId = params.boardId as string;
    const workspaceId = params.workspaceId as string;

    if (title === data.title) {
      return;
    }

    updateCard({
      id: data.id,
      title,
      boardId,
      workspaceId,
    });
  };

  const onBlur = () => {
    inputRef.current?.form?.requestSubmit();
  };

  return (
    <div className="mb-6 flex w-full items-start gap-x-3">
      <Layout className="mt-1 h-5 w-5 text-foreground" />
      <div className="w-full">
        <form action={onSubmit}>
          <Input
            id="title"
            name="title"
            ref={inputRef}
            onBlur={onBlur}
            defaultValue={title}
            className="-ml-1.5 -mt-1 h-8 w-[95%] truncate border-transparent bg-transparent px-1 text-xl font-semibold text-foreground focus-visible:bg-background"
          />
        </form>
        <p className="text-sm text-muted-foreground">
          in list <span className="underline">{data.list.title}</span>
        </p>
      </div>
    </div>
  );
};

Header.Skeleton = function HeaderSkeleton() {
  return (
    <div className="mb-6 flex items-start gap-x-3">
      <Skeleton className="mt-1 h-6 w-6 bg-neutral-200" />
      <div>
        <Skeleton className="mb-1 h-6 w-24 bg-neutral-200" />
        <Skeleton className="h-4 w-12 bg-neutral-200" />
      </div>
    </div>
  );
};
