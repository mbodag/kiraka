import React from 'react';
import { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  React.useEffect(() => {
    // Device detection logic runs after the component mounts on the client
    if (window.innerWidth < 1024) {
      // Display a message or redirect if the screen width indicates a non-desktop device
      alert('This application is only available on desktop and laptop devices.');
    }
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;