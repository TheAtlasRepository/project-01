import { useState, useEffect } from 'react';

const ServiceName = () => {
  const [serviceText, setServiceText] = useState('Image'); // Default text

  // Array of domains that will make the logo show "PDF"
  const PDF_URLS = process.env.NEXT_PUBLIC_PDF_URLS ? process.env.NEXT_PUBLIC_PDF_URLS.split(',') : [];

  useEffect(() => {
    // If the current host is in the array, change the text
    if (PDF_URLS.includes(window.location.host)) {
      setServiceText('PDF');
    }
  }, []);

  return (
    <span>{serviceText} To Map</span>
  );
};

export default ServiceName;