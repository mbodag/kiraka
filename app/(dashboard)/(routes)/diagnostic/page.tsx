"use client";

import styles from "./DiagnosticPage.module.css";
import Link from "next/link";
import ReadingTimer from "@/components/diagnostic/ReadingTimer";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const DiagnosticPage = () => {
  return (
    <div
      className={`${styles.diagnosticBg} flex flex-col items-center pt-10 pb-8 min-h-screen analytics-font`}
    >
      <div className="self-start absolute top-4 left-4">
        <Link href="/dashboard">
          <Button className="ml-4 shadow bg-lime-50/60 hover:bg-lime-50/100 text-gray-900 bold">
            Back
          </Button>
        </Link>
      </div>

      <h1 className="text-5xl font-bold mb-4">Diagnostic Page</h1>

      <div className="items-center">
        <div className="text-left">
          <p>
            This diagnostic test is designed to measure your reading speed and
            comprehension skills across a variety of text difficulties. Here’s
            how it works:
          </p>
          <ol className="mt-2">
            <li>
              You will be presented with 5 texts, each increasing in difficulty.
            </li>
            <li>
              For each text, click "Start" to begin reading and "Done" once you
              finish. Your reading time will be recorded.
            </li>
            <li>
              After each text, you'll take a short quiz to test your
              comprehension of what you've just read.
            </li>
            <li>
              Based on your reading speed and quiz scores, we'll provide
              personalized recommendations to improve your reading skills.
            </li>
          </ol>
        </div>
      </div>
      <ReadingTimer />
    </div>
  );
};

export default DiagnosticPage;
