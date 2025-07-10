import Image from "next/image";
import Link from "next/link";

import { auth, signOut } from "@/app/(auth)/auth";

import { History } from "./history";
import { SlashIcon } from "./icons";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export const Navbar = async () => {
  let session = await auth();


  return (
    <>
      <div className="bg-[#181A20]/90 backdrop-blur-md absolute top-0 left-0 w-dvw py-3 px-4 justify-between flex flex-row items-center z-30">
        <div className="flex flex-row gap-3 items-center">
          <History user={session?.user} />
          <Link href={"/"}>
            <div className="flex flex-row gap-2 items-center">
            <Image
              src="/images/gemini-logo.png"
              height={20}
              width={20}
              alt="gemini logo"
            />
            <div className="text-zinc-400">
              <SlashIcon size={16} />
            </div>
            <div className="text-sm text-white font-semibold truncate w-28 md:w-fit">
              Odin AI
            </div>
          </div>
          </Link>
        </div>

        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="py-2 px-3 h-fit font-normal bg-[#23272e] border border-[#2d3138] text-zinc-300 hover:bg-[#2d3138] hover:text-white transition-colors"
                variant="secondary"
              >
                {session.user?.email}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#181A20] border border-[#23272e]">
              <DropdownMenuItem className="text-zinc-300 hover:bg-[#23272e] hover:text-white">
                <ThemeToggle />
              </DropdownMenuItem>
              <DropdownMenuItem className="p-1 z-50 text-zinc-300 hover:bg-[#23272e] hover:text-white">
                <form
                  className="w-full"
                  action={async () => {
                    "use server";

                    await signOut({
                      redirectTo: "/",
                    });
                  }}
                >
                  <button
                    type="submit"
                    className="w-full text-left px-1 py-0.5 text-red-400 hover:text-red-300 transition-colors"
                  >
                    Sign out
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button className="py-2 px-3 h-fit font-normal text-white bg-green-600 hover:bg-green-700 border-green-700" asChild>
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>
    </>
  );
};
