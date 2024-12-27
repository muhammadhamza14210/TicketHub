import Image from "next/image";
import React from "react";
import logo from "../../images/logo.png";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import SearchBar from "../components/Searchbar";

const Header = () => {
  return (
    <div className="border-gray-300 shadow-sm bg-gradient-to-r from-gray-100 to-white">
      <div className="flex flex-col lg:flex-row items-center gap-4 p-4">
        <div className="flex items-center justify-between w-full lg:w-auto">
          <Link href="/" className="shrink-0 font-bold">
            <Image
              src={logo}
              alt="Logo"
              width={60}
              height={60}
              className="w-24 lg:w-28"
            />
          </Link>
          <div className="lg:hidden">
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button
                  className="bg-gray-100 text-gray-800 px-3
              py-1.5 text-sm rounded-lg hover:bg-gray-200 transition border border-gray-300"
                >
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
        <div className="w-full lg:max-w-2xl">
          <SearchBar />
        </div>

        <div className="hidden lg:block ml-auto">
          <SignedIn>
            <div className="flex items-center gap-3">
              <Link href="/seller">
                <Button
                  className="bg-blue-600 text-white px-3 py-1.5
                text-sm rounded-lg hover:bg-blue-700 transition"
                >
                  Sell Tickets
                </Button>
              </Link>

              <Link href="/tickets">
                <Button
                  className="bg-gray-100 text-gray-800 px-3 py-1.5
                text-sm rounded-lg hover:bg-gray-200 transition border border-gray-300"
                >
                  My Tickets
                </Button>
              </Link>
              <UserButton />
            </div>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <Button
                className="bg-gray-100 text-gray-800 px-3 py-1.5
                text-sm rounded-lg hover:bg-gray-200 transition border border-gray-300"
              >
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>
        </div>
        <div className="lg:hidden w-full flex justify-center gap-3">
          <SignedIn>
            <Link href="/seller" className="w-full">
              <Button
                className="bg-blue-600 text-white px-3 py-1.5
                text-sm rounded-lg hover:bg-blue-700 transition w-full"
              >
                Sell Tickets
              </Button>
            </Link>

            <Link href="/tickets" className="w-full">
              <Button
                className="bg-gray-100 text-gray-800 px-3 py-1.5
                text-sm rounded-lg hover:bg-gray-200 transition border border-gray-300 w-full"
              >
                My Tickets
              </Button>
            </Link>
          </SignedIn>
        </div>
      </div>
    </div>
  );
};

export default Header;
