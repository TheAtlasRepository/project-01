import { useState, useEffect } from 'react';

const Logo = () => {
  const [logoText, setLogoText] = useState('Image'); // Default text

  // Array of domains that will make the logo show "PDF"
  const PDF_URLS = process.env.NEXT_PUBLIC_PDF_URLS ? process.env.NEXT_PUBLIC_PDF_URLS.split(',') : [];

  useEffect(() => {
    // If the current host is in the array, change the text
    if (PDF_URLS.includes(window.location.host)) {
      setLogoText('PDF');
    }
  }, []);

  return (
    <div className={`flex justify-center items-center text-l text-white`}>
      <span><b>{logoText}</b> To Map</span>
    </div>
  );
};

export default Logo;