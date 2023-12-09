import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs";

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

  const profile = await api.profile.currentProfile.query();

  const orgMember = await api.organization.findMember.query({
    organizationId,
    profileId: profile.id,
  });

  if (!orgMember) {
    redirect(`/select-org`);
  }

  return <div>Organization Id: {params.organizationId}</div>;
};

export default OrganizationIdPage;
