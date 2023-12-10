import { Suspense } from "react";
import { redirect } from "next/navigation";

import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/server";

import { BoardList } from "./_components/board-list";
import { Info, InfoSkeleton } from "./_components/info";

interface OrganizationIdProps {
  params: {
    organizationId: string;
  };
}

const OrganizationIdPage = async ({
  params,
}: {
  params: { organizationId: string };
}) => {
  const { organizationId } = params;

  const { organization } = await api.organization.getOrganizationById.query({
    organizationId,
  });
  const { member } = await api.organization.findMember.query({
    organizationId,
  });

  if (!member) {
    redirect(`/select-org`);
  }

  return (
    <div className="mb-20 w-full">
      <Suspense fallback={<InfoSkeleton />}>
        <Info organization={organization} />
      </Suspense>
      <Separator className="my-4" />
      <div className="px-2 md:px-4">
        <BoardList />
      </div>
    </div>
  );
};

export default OrganizationIdPage;
