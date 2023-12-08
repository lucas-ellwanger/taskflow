import { api } from "@/trpc/server";
import { InitialModal } from "@/components/modals/initial-modal";

const SetupPage = async () => {
  const profile = await api.profile.initialProfile.mutate();

  const org = await api.organization.findFistByProfileId.query({
    profileId: profile.id,
  });

  return <InitialModal />;
};

export default SetupPage;
