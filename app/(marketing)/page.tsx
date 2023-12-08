import Link from "next/link";
import { Medal } from "lucide-react";

import { Button } from "@/components/ui/button";

const MarketingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        <div className="mb-4 flex items-center rounded-full border bg-amber-100 p-4 text-amber-700 shadow-sm">
          <Medal className="mr-2 h-6 w-6" />
          <p className="pt-1 tracking-wide">No. 1 Task Manager</p>
        </div>
        <h1 className="mb-6 text-center text-3xl text-neutral-800 md:text-6xl">
          Taskflow helps team move
        </h1>
        <div className="w-fit rounded-md bg-gradient-to-r from-fuchsia-600 to-pink-600 p-3 px-4 pt-3 text-3xl text-white md:pt-2 md:text-6xl">
          work forward.
        </div>
      </div>
      <div className="mx-auto mt-4 max-w-xs text-center text-sm text-neutral-400 md:max-w-2xl md:text-xl">
        Collaborate, manage projects, and reach new productivity peaks. From
        high rises to the home office, the way your team works is unique -
        accomplish it all with Taskify.
      </div>
      <Button className="mt-6" size="lg" asChild>
        <Link href="/sign-up">Get Taskflow for free</Link>
      </Button>
    </div>
  );
};

export default MarketingPage;
