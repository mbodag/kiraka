"use client";

import React, { useState } from 'react';
import styles from '../Dashboard.module.css';
import DashboardLayout from '../layout'; 
import { SelectedTextProvider } from "@/contexts/SelectedTextContext"; 
import { useAuth } from "@clerk/nextjs"; 


const UploadPage: React.FC = () => {
  const [title, setTitle] = useState(''); // Add a title for the text
  const [text, setText] = useState('');
  const { userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const minChars = 1500;
  const maxChars = 6000;

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    if (text.length < minChars || text.length > maxChars) {
      alert(`Text must be between ${minChars} and ${maxChars} characters.`);
      return;
    }
    else if (title.length > 30) {
      alert(`Please write a shorter title`);
      return;
    }
    setLoading(true); // Start loading indicator
    setTimeout(async () => { // Simulate network request
      const response = await fetch('/api/texts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text_content: text, user_id: userId, title: title })
      });

      if (response.ok) {
        window.location.href = '/flash-mode'; // Redirect after upload
      } else {
        const data = await response.json();
        console.error('Upload failed:', data);
        setLoading(false); // Stop loading indicator if failed
      }
    }, 2000); // Minimum display time for loading indicator
  };

  return (
    <SelectedTextProvider>
      <DashboardLayout navbarType="quiz">
        <div className={`${styles.dashboardBg} flex justify-center items-start pt-2 pb-8 min-h-screen monospace-jetbrains-mono`}>
          <div style={{ maxWidth: '45vw', width: '100%', background: '#fff', padding: '25px', borderRadius: '10px', boxShadow: '0 0 40px 8px rgba(0,0,0,0.2)', marginTop: '5vh' }}>
            <h1 style={{ fontSize: '25px', textAlign: 'center' }}>Upload Your Text</h1>
            <div style={{ fontSize: '13px', color: 'rgb(120, 0, 140)', textAlign: 'center', marginBottom: '20px',  marginTop: '10px' }}>
              Minimum 1500 characters and maximum 6000 characters.
            </div>
            <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
                Add a title:
                <textarea
                  name="title"
                  style={{ width: '100%', height: '5vh', fontSize: '14px', padding: '8px', border: '1px solid #ccc', borderRadius: '5px', overflow: 'hidden', resize: 'none'}}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </label>
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
                {text.length} / 6000 characters
              </div>
              <div style={{ fontSize: '12px', marginBottom: '10px' }}>
                By uploading, you agree to our <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>.
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