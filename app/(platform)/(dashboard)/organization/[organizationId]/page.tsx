import { redirect } from "next/navigation";

import { api } from "@/trpc/server";

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

  const { member } = await api.organization.findMember.query({
    organizationId,
  });

  if (!member) {
    redirect(`/select-org`);
  }

  return <div>Organization Page</div>;
};

export default OrganizationIdPage;
