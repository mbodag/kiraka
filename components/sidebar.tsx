"use client";

import React from 'react';
import { useSelectedText } from '../contexts/SelectedTextContext';
import Image from "next/legacy/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

const Sidebar = () => {
  const { setSelectedTextId } = useSelectedText();

  // Array of texts with their IDs
  const texts = Array.from({ length: 7 }, (_, index) => ({
    id: index + 1,
    title: `Day ${index + 1}`
  }));

  return (
    <div className="flex flex-col h-full bg-gradient-to-l from-black via-black to-black text-white border-r border-gray-700">
      {/* Logo, company name, and horizontal line */}
      <div className="py-4 mb-2 w-full text-center">
        {/* Existing Logo and Link Code */}
      </div>

      {/* Upload button aligned to the left */}
      <div className="px-3 py-2 mb-4 bg-gray-800">
        {/* Existing Upload Button Code */}
      </div>

      {/* Document buttons aligned to the left */}
      <div className="flex-1 px-3 py-2 space-y-1">
        {texts.map((text) => (
          <button
            key={text.id}
            onClick={() => setSelectedTextId(text.id)}
            className="text-sm w-full max-w-xs p-2 font-medium rounded-lg hover:bg-gray-700 transition sidebar-button-font"
          >
            {text.title}
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
