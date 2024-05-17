"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import TypewriterComponent from "typewriter-effect";
import { Button } from "@/components/ui/button";

export const LandingHero = () => {
  const { isSignedIn } = useAuth();
  return (
    <div className="text-white fond-bold pt-32 text-center space-y-8">
      <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl space-y-8 font-extrabold">
        <h1>Pioneering Speed-Reading <br></br> Platform for</h1>
        <div className="text-transparent bg-clip-text bg-gradient-to-r from-green-50 to-green-500">
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
        className="text-xl font-light text-zinc-200 bg-clip-text landing-font"
        style={{ marginTop: "110px" }}
      >
        Pushing the Limits of Accelerated Reading.
      </div>
      <div>
        <Link href={isSignedIn ? "/instructions" : "/sign-in"}>
          <Button
            className="animated-gradient-button md:text-lg p-4 md:p-6 rounded-full"
          >
            Start Speed Learning Now
          </Button>
        </Link>
      </div>
    </div>
  );
};
