"use client";

import React from 'react';
import { useSelectedText } from '../contexts/SelectedTextContext'; // Adjust path if necessary
import Image from "next/legacy/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

const Sidebar = () => {
  const { setSelectedText } = useSelectedText();

  // Array of texts for each document
  const texts = [
    'One for Document 1',
    'Two for Document 2',
    'Three for Document 3',
    'Four for Document 4',
    'Five for Document 5',
  ];

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
        {texts.map((text, index) => (
          <button
            key={`doc-${index}`}
            onClick={() => setSelectedText(text)}
            className="text-sm w-full max-w-xs p-2 font-medium rounded-lg hover:bg-gray-700 transition sidebar-button-font"
          >
            Document {index + 1}
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
