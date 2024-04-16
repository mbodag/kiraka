"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import TypewriterComponent from "typewriter-effect";
import { Button } from "@/components/ui/button";

export const LandingHero = () => {
  const { isSignedIn } = useAuth();
  return (
    <div className="text-white fond-bold py-20 text-center space-y-8">
      <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl space-y-5 font-extrabold">
        <h1>Pioneering Speed-Learning Platform for</h1>
        <div className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-green-600">
          <TypewriterComponent
            options={{
              strings: [
                "Researchers",
                "Professionals",
                "Students",
                "Bookworms",
                "",
              ],
              autoStart: true,
              loop: true,
              delay: 50, //Delay between each character
            }}
          />
        </div>
      </div>
      <div
        className="text-2xl font-light text-zinc-500 landing-font"
        style={{ marginTop: "110px" }}
      >
        Learn more. Read more. Understand more.
      </div>
      <div>
        <Link href={isSignedIn ? "/instructions" : "/sign-in"}>
          <Button
            variant="tertiary"
            className="md:text-lg p-4 md:p-6 rounded-full font-semibold"
          >
            Start Speed Learning Now
          </Button>
        </Link>
      </div>
    </div>
  );
};
