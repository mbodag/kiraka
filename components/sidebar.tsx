"use client";

import React, { useState, useEffect } from 'react';
import { useSelectedText } from '../contexts/SelectedTextContext';
import Image from "next/legacy/image";
import Link from "next/link";
import { UserButton, useUser, useAuth } from "@clerk/nextjs";

const Sidebar = () => {
  const { selectedTextId, setSelectedTextId } = useSelectedText();
  const [readTexts, setReadTexts] = useState<number[]>([]);

  // Array of texts with their IDs
  const texts = Array.from({ length: 7 }, (_, index) => ({
    id: index + 1,
    title: `Text ${index + 1}`,
  }));

  const { user } = useUser();
  const { userId } = useAuth();

  useEffect(() => {
    const fetchReadTexts = async (userId: string | null | undefined) => {
      try {
        const response = await fetch(`/api/practiced_texts/?user_id=${userId}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        const read_texts = data.read_texts;
        setReadTexts(read_texts); // Update the state with the fetched data
      } catch (error) {
        console.error("Error fetching text:", error);
      }
    };
    if (userId) {
      fetchReadTexts(userId);
    }
  }, [userId]);

  const handleFeedbackClick = () => {
    window.location.href = 'https://forms.gle/nijvaqhDHYo3QE2v5'; // Link to google feedback form
  };

  const handleTextClick = (textId: any) => {
    setSelectedTextId(textId);  // Set the selected text ID
    // window.location.reload();    // Force a full page reload
  };

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
            onClick={() => handleTextClick(text.id)}
            className={`text-sm w-full max-w-xs p-2 font-medium rounded-lg transition sidebar-button-font 
              ${text.id === selectedTextId ? 'bg-gray-700' : 'hover:bg-gray-800'}
              ${readTexts.includes(text.id) ? 'text-green-600' : ''}`} // Apply active or hover class
          >
            {text.title}
          </button>
        ))}
        {readTexts.length >= 2 && (
          <div className="pt-8">  {/* This div wraps the button and applies a top margin */}
          <button
            className="text-sm w-full max-w-xs p-2 font-medium rounded-lg bg-green-900 hover:bg-green-700 transition sidebar-button-font"
            onClick={handleFeedbackClick}
          >
            Give Feedback
          </button>
        </div>
      )}
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
