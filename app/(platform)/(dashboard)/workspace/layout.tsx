import { api } from "@/trpc/server";

import { Sidebar } from "../_components/sidebar";

const WorkspaceLayout = async ({ children }: { children: React.ReactNode }) => {
  const workspaces = await api.workspace.getUserMemberships.query();

  return (
    <main className="mx-auto max-w-6xl px-4 pt-20 md:pt-24 2xl:max-w-screen-xl">
      <div className="flex gap-x-7">
        <div className="hidden w-64 shrink-0 md:block">
          <Sidebar workspaces={workspaces} />
        </div>
        {children}
      </div>
    </main>
  );
};

export default WorkspaceLayout;
