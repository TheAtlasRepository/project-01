'use client';
import UploadPipeline from '@/components/component/uploadPipeline';
import Navbar from '../components/ui/navbar';
import { Suspense } from 'react';
import Link from 'next/link';
import ServiceName from '@/components/ui/return-service-name';

export default function Home() {
  return (
    <main className="flex flex-col bg-white dark:bg-gray-900">
      <Navbar
        activePage="Home"
      />
      
      <div className="items-center py-10 justify-between">
        <Suspense fallback={<div>Loading...</div>}>
          <UploadPipeline />
        </Suspense>
      </div>

      <div className="flex justify-center p-2 py-10">
        <div className="flex flex-col 2xl:flex-row md:w-5/6 lg:w-3/4 xl:w-1/2 2xl:w-1/2 justify-between">
          <div className="2xl:w-1/4 p-6 pl-0 flex items-center justify-center h-full">
            <h1 className="text-center xl:text-left text-pretty text-5xl font-bold text-primary dark:text-gray-300">
              The simplest way to geo-reference
            </h1>
          </div>
          <div className="2xl:w-3/4 p-6 card dark:bg-gray-800">
            <p className="text-lg text-secondary dark:text-gray-300">
              Discover <ServiceName />, the simplest solution for seamlessly georeferencing digital images and PDF files! 
              Effortlessly upload your documents and pinpoint specific locations by selecting reference points on the image. 
              By embedding geospatial metadata, you can transform your files into geographically accurate representations, 
              perfect for urban planning, environmental analysis, or historical research. 
              <br /><br />
              Whether you're a GIS expert or new to spatial data, our intuitive platform makes georeferencing accessible to all. 
              Start exploring the possibilities with <ServiceName /> today!
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center p-2 py-10">
        <div className="flex flex-col-reverse 2xl:flex-row md:w-5/6 lg:w-3/4 xl:w-1/2 2xl:w-1/2 justify-between">
          <div className="2xl:w-3/4 p-6 card dark:bg-gray-800">
            <p className="text-lg text-secondary dark:text-gray-300">
              Are you craving more geospatial fun? Check out our sister-application, <Link href="#" className='underline'>Text2Map</Link>. Unleash your creativity by effortlessly transforming text, lists, 
              or questions into captivating geospatial maps. Whether you're a seasoned explorer or just starting your journey, 
              Text2Map offers a user-friendly platform to craft intriguing visual representations of geographic data. Dive in today and elevate your mapping experience!
            </p>
          </div>
          <div className="2xl:w-1/4 p-6 pl-0 flex items-center justify-center h-full">
            <h1 className="text-center xl:text-left text-pretty text-5xl font-bold text-primary dark:text-gray-300 xl:ml-6">
              Need more?
            </h1>
          </div>
        </div>
      </div>

      <div className="flex justify-center p-2 py-10">
        <div className="flex flex-col 2xl:flex-row md:w-5/6 lg:w-3/4 xl:w-1/2 2xl:w-1/2 justify-between">
          <div className="2xl:w-1/4 p-6 pl-0 flex items-center justify-center h-full">
            <h1 className="text-center xl:text-left text-pretty text-5xl font-bold text-primary dark:text-gray-300">
            Need even <span className='underline'>more</span>?
            </h1>
          </div>
          <div className="2xl:w-3/4 p-6 card dark:bg-gray-800">
            <p className="text-lg text-secondary dark:text-gray-300">
            Check out <Link href="https://atlas.co" className='underline'>Atlas</Link>, a game-changer in the world of GIS. While Image2Map simplifies the process of georeferencing digital images and PDFs, 
            making this complex mapping tasks accessible to users of all skill levels, Atlas further broadens the horizon by revolutionizing the creation, analysis, 
            and sharing of geospatial data through its intuitive, browser-based interface. Atlas invites everyone, from GIS experts to those new to spatial analysis, 
            to effortlessly delve into the world of maps and geospatial data without the need for specialized knowledge. Embrace the future of geospatial analysis 
            and mapping with Atlas, and be part of the community shaping the next wave of digital mapping solutions.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}