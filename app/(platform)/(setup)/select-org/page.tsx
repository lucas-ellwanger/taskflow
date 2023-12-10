import { redirect } from "next/navigation";

import { InitialModal } from "@/components/modals/initial-modal";
import { api } from "@/trpc/server";

const SetupPage = async () => {
  const { organization } = await api.organization.findFistByUserId.query();

  if (organization) {
    redirect(`/organization/${organization.id}`);
  }

  return <InitialModal />;
};

export default SetupPage;
