import React from 'react';
import { useRef } from "react";
import { useState, useEffect } from "react";
import Link from 'next/link';
import Logo from './logo';
import { HamburgerMenuIcon } from '@radix-ui/react-icons'

interface NavbarProps {
    activePage: string;
}

const Navbar: React.FC<NavbarProps> = ({ activePage }) => {
  const [isOpen, setOpen] = useState(false);
  const mobileRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [isOpen]);

  return (
    <div>
      <div className="flex justify-between items-center py-3 px-4 background-dark lg:mb-10 z-20 relative">
        {/* Service name / Logo */}
        <a href="http://localhost:3000/">
            <div className="flex items-center px-5">
             <Logo />
            </div>
        </a>

        {/* Desktop menu */}
        <div className="hidden md:flex lg:items-center">
          <div className="flex items-center text-xs">
            <button className={`btn-nav ${activePage === 'Home' ? 'btn-nav-active' : ''}`}>
              <Link href="/">Home</Link>  
            </button>

            <button className={`btn-nav ${activePage === 'About' ? 'btn-nav-active' : ''}`}>
              <Link href="/About">About</Link>  
            </button>

            <button className={`btn-nav ${activePage === 'Your Data' ? 'btn-nav-active' : ''}`}>
              <Link href="/Privacy">Your Data</Link>  
            </button>

          </div>
        </div>

        {/* Mobile menu button and icon */}
        <div ref={mobileRef} className="md:hidden flex flex-col">
          <button
            onClick={() => setOpen(!isOpen)}
            className="block border-0 bg-transparent px-2 text-gray-500 hover:no-underline hover:shadow-none focus:no-underline focus:shadow-none focus:outline-none focus:ring-0 dark:text-neutral-200 lg:hidden"
            type="button"
            data-twe-collapse-init
            data-twe-target="#navbarSupportedContent14"
            aria-controls="navbarSupportedContent14"
            aria-expanded="false"
            aria-label="Toggle navigation">
            <HamburgerMenuIcon className="h-10 w-10" />
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`background-dark h-screen w-screen shadow-sm absolute z-10 ${isOpen ? 'top-16 transition-all duration-500 ease-out' : '-top-[2000px] transition-all duration-500 ease-in'}`}>
        <div className="flex flex-col items-center justify-center text-2xl h-5/6">
          <button className={`my-2 btn-nav btn-nav-mob ${activePage === 'Home' ? 'btn-nav-active' : ''}`}>
            <Link href="/">Home</Link>  
          </button>

          <button className={`my-2 btn-nav btn-nav-mob ${activePage === 'About' ? 'btn-nav-active' : ''}`}>
            <Link href="/About">About</Link>  
          </button>

          <button className={`my-2 btn-nav btn-nav-mob ${activePage === 'Your Data' ? 'btn-nav-active' : ''}`}>
            <Link href="/Privacy">Your Data</Link>  
          </button>

          <button className={`my-2 mb-6 btn-nav btn-nav-mob ${activePage === 'Text & CSV To Map' ? 'btn-nav-active' : ''}`}>
            <Link href="/Text2Map">Text & CSV To Map</Link>  
          </button>
        </div>
      </div>
    </div>

  );
};

export default Navbar;