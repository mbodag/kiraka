"use client";

import React, { useState } from 'react';
import { useSelectedText } from '../contexts/SelectedTextContext';
import Image from "next/legacy/image";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";

const Sidebar = () => {
  const { selectedTextId, setSelectedTextId } = useSelectedText();

  // Array of texts with their IDs
  const texts = Array.from({ length: 7 }, (_, index) => ({
    id: index + 1,
    title: `Text ${index + 1}`,
  }));

  const { user } = useUser();

  return (
    <div className="flex flex-col h-full bg-gradient-to-l from-black via-black to-black text-white border-r border-gray-700">
      {/* Logo, company name, and horizontal line */}
      <div className="py-4 mb-2 w-full text-center">
        <Link href="/">
          <div className="inline-flex items-center justify-center cursor-pointer mr-8">
            <div className="relative w-8 h-8 mr-4 inline-block">
              <Image
                src="/Kiraka_Logo.png"
                alt="Kiraka Logo"
                layout="fill"
                objectFit="contain"
              />
            </div>
            <span className="monospace-jetbrains-mono text-2xl font-bold">Kiraka.ai</span>
          </div>
        </Link>
        <hr className="border-t border-gray-700 mt-2 w-3/4 mx-auto" />{" "}
        {/* Horizontal line */}
      </div>

      {/* Upload button aligned to the left */}
      {/* <div className="px-3 py-2 mb-4 bg-gray-800">
        <Link href="/upload">
          <button className="text-sm w-full max-w-xs p-2 font-medium rounded-lg hover:bg-gray-700 transition sidebar-button-font">
            Upload Files
          </button>
        </Link>
      </div> */}
      {/* TEMPORARY REPLACEMENT FOR THE UPLOAD BUTTON FOR MVP LAUNCH */}
      <div className="flex justify-center items-center px-3 py-2 mb-4 bg-gray-800">
        <p className="text-md p-2 font-medium rounded-lg">
          Your Texts
        </p>
      </div>

      {/* Document buttons aligned to the left */}
      <div className="flex-1 px-3 py-2 space-y-1">
        {texts.map((text) => (
          <button
            key={text.id}
            onClick={() => { 
              setSelectedTextId(text.id); // Update the global context
            }}
            className={`text-sm w-full max-w-xs p-2 font-medium rounded-lg transition sidebar-button-font 
              ${text.id === selectedTextId ? 'bg-gray-700' : 'hover:bg-gray-700'}`} // Apply active or hover class
          >
            {text.title}
          </button>
        ))}
      </div>

      {/* User button at the bottom */}

      <div className="flex item-center m-2">
        <div>
          <UserButton afterSignOutUrl="/" />
        </div>
        <div>
          {user ? (
            <div className=" m-2">
              <div className="text-sm font-medium">{user.fullName}</div>
            </div>
          ) : (
            <div className="text-sm font-medium">Not signed in</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
