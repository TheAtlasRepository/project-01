'use client';
import Navbar from '@/components/ui/navbar';

export default function About() {
  return (
    <main className="flex flex-col bg-white dark:bg-gray-900">
      <Navbar
        activePage="Your Data"
      />

      <div className="flex justify-center p-2 py-5 pt-10">
        <div className="flex flex-col md:w-5/6 lg:w-3/4 xl:w-1/2 justify-between">
            <h1 className="text-5xl font-bold text-primary mb-5 px-6 dark:text-gray-300">
                How We Handle Your Data<br />
            </h1>
          <div className="w-100 p-6 card dark:bg-gray-800">
            <p className="text-lg text-secondary dark:text-gray-300">
              This page outlines how we handle your data when you use our services.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center p-2 py-5">
        <div className="flex flex-col md:w-5/6 lg:w-3/4 xl:w-1/2 justify-between">
            <h2 className="text-3xl font-bold text-primary mb-5 px-6 dark:text-gray-300">
              What we learn about you<br />
            </h2>
          <div className="w-100 p-6 card dark:bg-gray-800">
            <p className="text-lg text-secondary dark:text-gray-300">
              We value your privacy and strive to keep your information secure. When you use our service, we may collect information such as your IP address, hardware information, software  information and file names. This data is utilized solely for improving our service and for service security. We do not retain any other identifying information on our servers or logs, and the logs are deleted after a short period. If you are detected as misusing our service, you may be blocked from accessing it. We do not share your information with any third parties.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center p-2 py-5">
        <div className="flex flex-col md:w-5/6 lg:w-3/4 xl:w-1/2 justify-between">
            <h2 className="text-3xl font-bold text-primary mb-5 px-6 dark:text-gray-300">
              Image Uploads<br />
            </h2>
          <div className="w-100 p-6 card dark:bg-gray-800">
            <p className="text-lg text-secondary dark:text-gray-300">
              Regarding the images you upload: they are essential for the functionality of our service. However, rest assured that they are only temporarily stored on our servers during your session. Once your session ends, these images are promptly deleted, and we do not maintain any copies of them. If you upload a PDF for selecting a page to use, this PDF is removed from the server right after confirming. We do not perform any analysis on the content of the files you upload, and we do not share them with any third parties.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center p-2 py-5">
        <div className="flex flex-col md:w-5/6 lg:w-3/4 xl:w-1/2 justify-between">
            <h2 className="text-3xl font-bold text-primary mb-5 px-6 dark:text-gray-300">
                Updating This Page<br />
            </h2>
          <div className="w-100 p-6 card dark:bg-gray-800">
            <p className="text-lg text-secondary dark:text-gray-300">
            From time to time, we may update this Privacy Policy to reflect changes in our practices or to comply with legal requirements. Any updates will be promptly reflected on this page, and we encourage you to review this Privacy Policy periodically for any updates. Last update was on 2024-04-XX.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}