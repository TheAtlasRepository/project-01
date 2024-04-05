'use client';
import Navbar from '@/components/ui/navbar';

export default function About() {
  return (
    <main className="flex flex-col bg-white dark:bg-gray-900">
      <Navbar
        activePage="About"
      />

      <div className="flex justify-center p-2 py-5 pt-10">
        <div className="flex flex-col md:w-5/6 lg:w-3/4 xl:w-1/2 justify-between">
            <h1 className="text-5xl font-bold text-primary mb-5 px-6 dark:text-gray-300">
                Welcome to Image2Map!<br />
            </h1>
          <div className="w-100 p-6 card dark:bg-gray-800">
            <p className="text-lg text-secondary dark:text-gray-300">
            Image2Map is a simple to use web application designed to enable users to georeference images and PDF files with ease.
            Aimed at addressing the lack of an easy-to-use online tool for georeferencing within the GIS landscape, our solution does away with the need for archaic 
            desktop software for georeferencing. 
          
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center p-2 py-5">
        <div className="flex flex-col md:w-5/6 lg:w-3/4 xl:w-1/2 justify-between">
            <h2 className="text-3xl font-bold text-primary mb-5 px-6 dark:text-gray-300">
                Who are we?<br />
            </h2>
          <div className="w-100 p-6 card dark:bg-gray-800">
            <p className="text-lg text-secondary dark:text-gray-300">
            Our team consists of five students enrolled in the Bachelor's program in IT and Information Systems at the University of Agder. 
            The Image2Map application serves as our bachelor's degree project.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center p-2 py-5">
        <div className="flex flex-col md:w-5/6 lg:w-3/4 xl:w-1/2 justify-between">
            <h2 className="text-3xl font-bold text-primary mb-5 px-6 dark:text-gray-300">
                Why Image2Map?<br />
            </h2>
          <div className="w-100 p-6 card dark:bg-gray-800">
            <p className="text-lg text-secondary dark:text-gray-300">
            We got the exciting opportunity to work with <a href="https://atlas.co/" className='underline' >Atlas</a> for our bachelor's project
            to develop a web based solution that would simplify the process of georeferencing. The team 
            at Atlas has provided us with valuable feedback and guidance throughout the development process. 
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}