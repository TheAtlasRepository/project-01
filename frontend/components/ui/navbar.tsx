import React from 'react';
import { useRef } from "react";
import { useState, useEffect } from "react";
import Link from 'next/link';
import Logo from './logo';
import { HamburgerMenuIcon } from '@radix-ui/react-icons'
import { Badge } from "@/components/ui/badge"

interface NavbarProps {
    activePage: string;
}

const Navbar: React.FC<NavbarProps> = ({ activePage }) => {
  const [isOpen, setOpen] = useState(false);
  const mobileRef = useRef(null);
  const pages = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/About' },
    { name: 'Your Data', path: '/Privacy' },
  ];

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
        <Link href="/">
            <div className="flex items-center px-5">
             <Logo />
             <Badge variant="destructive" className='ml-3 mt-1'> BETA </Badge>
            </div>
        </Link>  

        {/* Desktop menu */}
        <div className="hidden md:flex lg:items-center">
          <div className="flex items-center text-xs">
          {pages.map((page) => (
            <button className={`btn-nav ${activePage === page.name ? 'btn-nav-active' : ''}`} key={page.name}>
              <Link href={page.path}>{page.name}</Link>
            </button>
          ))}

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
      <div className={`md:hidden background-dark h-screen w-screen shadow-sm absolute z-10 ${isOpen ? 'top-16 transition-all duration-500 ease-out' : '-top-[2000px] transition-all duration-500 ease-in'}`}>
        <div className="flex flex-col items-center justify-center text-2xl h-5/6">
          {pages.map((page) => (
            <button className={`my-2 btn-nav btn-nav-mob ${activePage === page.name ? 'btn-nav-active' : ''}`} key={page.name}>
              <Link href={page.path}>{page.name}</Link>
            </button>
          ))}
        </div>
      </div>
    </div>

  );
};

export default Navbar;