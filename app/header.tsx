"use client";

import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";

export function Header() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <header className="flex justify-end items-center p-4 gap-4 h-16" />;
  }

  return (
    <header className="flex justify-end items-center p-4 gap-4 h-16">
      {!isSignedIn ? (
        <>
          <SignInButton mode="modal" fallbackRedirectUrl="/dashboard" />
          <SignUpButton mode="modal" fallbackRedirectUrl="/dashboard">
            <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
              Sign Up
            </button>
          </SignUpButton>
        </>
      ) : (
        <UserButton />
      )}
    </header>
  );
}
