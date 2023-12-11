import { redirect } from "next/navigation";

import { InitialModal } from "@/components/modals/initial-modal";
import { api } from "@/trpc/server";

const SetupPage = async () => {
  const { workspace } = await api.workspace.findFistByUserId.query();

  if (workspace) {
    redirect(`/workspace/${workspace.id}`);
  }

  return <InitialModal />;
};

export default SetupPage;
