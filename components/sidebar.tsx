"use client";

import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

const Sidebar = () => {
  return (
    <div className="flex flex-col h-full bg-gradient-to-l from-black via-black to-black text-white">
      {/* Logo, company name, and horizontal line */}
      <div className="py-4 mb-2 w-full text-center">
        <Link href="/">
          <div className="inline-flex items-center justify-center cursor-pointer mr-8">
            <div className="relative w-8 h-8 mr-4 inline-block">
              <Image src="/Kiraka_Logo.png" alt="Kiraka Logo" layout="fill" objectFit="contain" />
            </div>
            <span className="text-2xl font-bold">Kiraka.ai</span>
          </div>
        </Link>
        <hr className="border-t border-gray-700 mt-2" /> {/* Horizontal line */}
      </div>

      {/* Upload button aligned to the left */}
      <div className="px-3 py-2 mb-4 bg-gray-800">
        <button className="text-sm w-full max-w-xs p-2 font-medium rounded-lg hover:bg-gray-700 transition">
          Upload Files
        </button>
      </div>

      {/* Document buttons aligned to the left */}
      <div className="flex-1 px-3 py-2 space-y-1">
        {Array.from({ length: 5 }, (_, i) => (
          <button key={`doc-${i+1}`} className="text-sm w-full max-w-xs p-2 font-medium rounded-lg hover:bg-gray-700 transition">
            Document {i + 1}
          </button>
        ))}
      </div>

      {/* User button at the bottom */}
      <div className="px-3 py-2">
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
};

export default Sidebar;