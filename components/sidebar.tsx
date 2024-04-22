"use client";

import React, { useState, useEffect } from 'react';
import { useSelectedText } from '@/contexts/SelectedTextContext';
import Image from "next/legacy/image";
import Link from "next/link";
import { UserButton, useUser, useAuth } from "@clerk/nextjs";
import { HiOutlineDocumentText } from "react-icons/hi";
import { TbBrandGoogleAnalytics } from "react-icons/tb";
import { RiHome2Line } from "react-icons/ri";

const Sidebar = () => {
  const { selectedTextId, setSelectedTextId } = useSelectedText();
  const [readTexts, setReadTexts] = useState<number[]>([]);
  const [userTexts, setUserTexts] = useState<{id: number, title:string}[]>([]);

  // Array of texts with their IDs
  const texts = Array.from({ length: 5 }, (_, index) => ({
    id: index + 1,
    title: ["Bioluminescence", "Aurora Borealis", "Tungsten", "NASA Mars Rover", "Health & Longevity"][index],
  }));

  const { user } = useUser();
  const { userId } = useAuth();

  useEffect(() => {
    const fetchUserTexts = async (userId: string | null | undefined) => {
      try {
        const response = await fetch(`/api/texts/user/?user_id=${userId}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        const user_texts = data.map((text: any) => ({ id: text.text_id, title: `Your text ${text.text_id + 1}` }));
        console.log(user_texts)
        setUserTexts(user_texts); // Update the state with the fetched data
      } catch (error) {
        console.error("Error fetching text:", error);
      }
    }
    if (userId) {
      fetchUserTexts(userId);
    }
  }, [userId]);

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
    window.open('https://forms.gle/nijvaqhDHYo3QE2v5', '_blank'); // Opens the link in a new tab
  };

  const handleTextClick = (textId: any) => {
    setSelectedTextId(textId);  // Set the selected text ID
    // window.location.reload();    // Force a full page reload
  };

  return (
    <div className="sidebar-container flex flex-col h-full bg-gradient-to-l from-black via-black to-black text-white border-t border-r border-black">
      {/* Logo, company name, and horizontal line */}
      <div className="fixed-top p-4 mb-2 w-full text-center">
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
        <hr className="border-t border-gray-700 mt-2 mx-auto" style={{ width: '100%' }} />
        {/* Horizontal line */}
        {/* Link buttons with icons */}
        <div className="flex text-sm flex-col items-start mt-4"> {/* Changed to items-start and added padding left */}
          <Link href="/" passHref>
            <button className="flex items-center mb-2 text-white px-2 py-1 hover:text-cyan-500">
              <RiHome2Line className="mr-2 text-lg" /> Home {/* Icon with margin right */}
            </button>
          </Link>
          <Link href="/instructions" passHref>
            <button className="flex items-center mb-2 text-white px-2 py-1 hover:text-orange-500">
              <HiOutlineDocumentText className="mr-2 text-lg" /> Instructions {/* Icon with margin right */}
            </button>
          </Link>
          <Link href="/analytics" passHref>
            <button className="flex items-center text-white px-2 py-1 hover:text-blue-500">
              <TbBrandGoogleAnalytics className="mr-2 text-lg" /> Analytics {/* Icon with margin right */}
            </button>
          </Link>
        </div>
        <hr className="border-t border-gray-700 mt-4 mx-auto" style={{ width: '100%' }} />
      </div>

      {/* Upload button aligned to the left */}
      { <div className="px-3 py-2 mb-4 bg-gray-800">
        <Link href="/upload">
          <button className="text-sm w-full max-w-xs p-2 font-medium rounded-lg hover:bg-gray-700 transition sidebar-button-font">
            Upload your own text
          </button>
        </Link>
      </div>}
      <div className="flex justify-center items-center px-3 py-2 mb-4 bg-gray-800">
        <p className="text-md p-2 font-medium rounded-lg">
          Kiraka&apos;s Texts
        </p>
      </div>

      {/* Document buttons aligned to the left */}
      <div className="flex-1 px-3 py-2 space-y-1">
        {texts.map((text) => (
          <button
            key={text.id}
            onClick={() => handleTextClick(text.id)}
            className={`text-sm w-full max-w-xs p-2 font-medium rounded-lg transition sidebar-button-font 
              ${text.id === selectedTextId ? 'bg-gray-800' : 'hover:bg-gray-900'}
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
        <div className="flex justify-center items-center px-3 py-2 mb-4 bg-gray-800">
          <p className="text-md p-2 font-medium rounded-lg">
            Your texts
          </p>
       </div>
       {userTexts.map((text) => (
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
      
      </div>

      {/* User button fixed at the bottom */}
      <div className="fixed-bottom flex item-center m-2">
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
