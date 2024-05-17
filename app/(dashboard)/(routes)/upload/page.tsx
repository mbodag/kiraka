"use client";

import React, { useState } from 'react';
import styles from '../Dashboard.module.css';
import DashboardLayout from '../layout'; 
import { SelectedTextProvider } from "@/contexts/SelectedTextContext"; 
import { useAuth } from "@clerk/nextjs"; 
import Routes from '@/config/routes';


const UploadPage: React.FC = () => {
  const [title, setTitle] = useState(''); // Add a title for the text
  const [text, setText] = useState('');
  const { userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const minCharsText = 1500; // Default for all users
  const maxCharsText = 6000;
  const minCharsTitle = 2;
  const maxCharsTitle = 10;

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    if (text.length < minCharsText || text.length > maxCharsText) {
      alert(`Text must be between ${minCharsText} and ${maxCharsText} characters.`);
      return;
    }
    else if (title.length < minCharsTitle || title.length > maxCharsTitle) {
      alert(`Title must be between ${minCharsTitle} and ${maxCharsTitle} characters.`);
      return;
    }
    setLoading(true); // Start loading indicator
    setTimeout(async () => { // Simulate network request
      try {
        const response = await fetch('/api/texts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text_content: text, user_id: userId, title: title })
        });
  
        if (response.ok) {
          // Check if there's history to go back to; if not, navigate to a default route
          if (window.history.length > 1) {
            window.history.back(); // Go back to the previous page after a successful response
          } else {
            // Use a fallback URL if no history is available
            window.location.href = Routes.DEFAULT_MODE;
          }
        } else {
          const data = await response.json();
          console.error('Upload failed:', data);
          setLoading(false); // Stop loading indicator if failed
        }
      } catch(error) {
        console.error('Upload failed:', error);
        setLoading(false); // Stop Loading indicator if failed
        if (window.history.length > 1){
          window.history.back(); // Go back to the previous page after a successful response
        } else {
          // Use a fallback URL if no history is available
          window.location.href = Routes.DEFAULT_MODE
        }
      }
    }, 2000); // Minimum display time for loading indicator
  };


  return (
    <SelectedTextProvider>
      <DashboardLayout navbarType="quiz">
        <div className={`${styles.dashboardBg} flex justify-center items-start pt-2 pb-8 min-h-screen monospace-jetbrains-mono`}>
          <div style={{ maxWidth: '45vw', width: '100%', background: '#fff', padding: '35px', borderRadius: '10px', boxShadow: '0 0 40px 8px rgba(0,0,0,0.2)', marginTop: '1vh' }}>
            <h1 style={{ fontSize: '25px', textAlign: 'center', marginBottom: '30px' }}>Upload Your Text</h1>
            <div style={{ fontSize: '13px', color: 'rgb(120, 0, 140)', textAlign: 'center', marginBottom: '20px',  marginTop: '10px' }}>
              The title should be between {minCharsTitle} and {maxCharsTitle} characters, and the text between {minCharsText} and {maxCharsText} characters.
            </div>
            <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              Add a title:
              <textarea
                name="title"
                style={{ width: '100%', height: '5vh', fontSize: '14px', padding: '8px', border: '1px solid #ccc', borderRadius: '5px', overflow: 'hidden', resize: 'none' }}
                value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') e.preventDefault();
                }}
              />
            </label>
            <div style={{ textAlign: 'right', fontSize: '12px', marginBottom: '10px' }}>
              {title.length} / {maxCharsTitle} characters
            </div>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              Paste your text here:
              <textarea
                name="uploaded_text"
                style={{ width: '100%', height: '40vh', fontSize: '14px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
                value={text}
                onChange={e => setText(e.target.value)}
              />
            </label>
            <div style={{ textAlign: 'right', fontSize: '12px', marginBottom: '10px' }}>
              {text.length} / {maxCharsText} characters
            </div>
            <div style={{ fontSize: '13px', color: 'rgb(10, 100, 140)', marginBottom: '20px',  marginTop: '15px' }}>
              By uploading, you agree to our <a href="/terms" target="_blank" rel="noopener noreferrer"><u>Terms of Service</u></a>.
            </div>

            <button type="submit" className="SubmitButton" disabled={loading}>
            {loading ? (
              <p>Please Wait
                <span className="dot">.</span>
                <span className="dot">.</span>
                <span className="dot">.</span>
              </p>
            ) : 'Upload'}
            </button>
            </form>
          </div>
        </div>
      </DashboardLayout>
    </SelectedTextProvider>
  );
};

export default UploadPage;