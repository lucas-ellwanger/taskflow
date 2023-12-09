import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs";

import { api } from "@/trpc/server";

interface OrganizationIdLayoutProps {
  children: React.ReactNode;
  params: {
    organizationId: string;
  };
}

const OrganizationIdLayout = async ({
  children,
  params,
}: OrganizationIdLayoutProps) => {
  const { organizationId } = params;
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const profile = await api.profile.currentProfile.query();

  const orgMember = await api.organization.findMember.query({
    organizationId,
    profileId: profile.id,
  });

  if (!orgMember) {
    redirect(`/select-org`);
  }

  return <>{children}</>;
};

export default OrganizationIdLayout;
