'use client';
import React, { useState } from 'react';
import DashboardLayout from '../layout'; // Adjust the path if necessary
import { SelectedTextProvider } from "@/contexts/SelectedTextContext"; // Adjust the import path as necessary

const UploadPage: React.FC = () => {
  const [text, setText] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const response = await fetch('/api/texts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text_content: text, user_id: 1 })
    });

    const data = await response.json();
    // handle response data
  };

  return (
    <SelectedTextProvider>
      <DashboardLayout navbarType="quiz">
        <div>
          <form onSubmit={handleSubmit}>
            <label>
              Paste your text here: 
              <textarea 
                name="uploaded_text" 
                style={{ height: '500px', width:'500px', fontSize: '14pt' }} 
                value={text} 
                onChange={e => setText(e.target.value)} 
              />
            </label>
            <input type="submit" value="Submit" />
          </form>
        </div>
      </DashboardLayout>
    </SelectedTextProvider>
  );
};

export default UploadPage;