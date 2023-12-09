import { redirect } from "next/navigation";
import { api } from "@/trpc/server";

import { InitialModal } from "@/components/modals/initial-modal";

const SetupPage = async () => {
  await api.profile.initialProfile.mutate();

  const currentProfile = await api.profile.currentProfile.query();

  if (!currentProfile) return;

  const org = await api.organization.findFistByProfileId.query({
    profileId: currentProfile.id,
  });

  if (org) {
    redirect(`/organization/${org.id}`);
  }

  return <InitialModal />;
};

export default SetupPage;
