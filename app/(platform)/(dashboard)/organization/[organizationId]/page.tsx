import { Suspense } from "react";
import { redirect } from "next/navigation";

import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/server";

import { Sidebar } from "../../_components/sidebar";
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
  const organizations = await api.organization.getUserMemberships.query();
  const { member } = await api.organization.findMember.query({
    organizationId,
  });

  if (!member) {
    redirect(`/select-org`);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pt-20 md:pt-24 2xl:max-w-screen-xl">
      <div className="flex gap-x-7">
        <div className="hidden w-64 shrink-0 md:block">
          <Sidebar organizations={organizations} />
        </div>
        <div className="mb-20 w-full">
          <Suspense fallback={<InfoSkeleton />}>
            <Info organization={organization} />
          </Suspense>
          <Separator className="my-4" />
          <div className="px-2 md:px-4">
            <BoardList />
          </div>
        </div>
      </div>
    </main>
  );
};

export default OrganizationIdPage;
