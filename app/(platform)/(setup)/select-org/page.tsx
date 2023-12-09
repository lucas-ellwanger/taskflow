import { redirect } from "next/navigation";

import { InitialModal } from "@/components/modals/initial-modal";
import { api } from "@/trpc/server";

const SetupPage = async () => {
  await api.profile.initialProfile.mutate();

  const currentProfile = await api.profile.currentProfile.query();

  const org = await api.organization.findFistByProfileId.query({
    profileId: currentProfile.id,
  });

  if (org) {
    redirect(`/organization/${org.id}`);
  }

  return <InitialModal />;
};

export default SetupPage;
