import Image from "next/image";
import React from "react";

const DownloadApp: React.FC = () => {
  return (
    <section className="py-16 bg-blue-600 text-white">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-8 md:mb-0">
          <h2 className="text-3xl font-bold mb-6">Download Our Mobile App</h2>
          <p className="text-xl mb-8 opacity-90">
            Get instant access to doctors, medicines, lab tests and more right
            from your smartphone.
          </p>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <button className="px-6 py-3 bg-black text-white rounded-lg flex items-center">
              <i className="fab fa-apple text-2xl mr-3" />
              <div>
                <div className="text-xs">Download on the</div>
                <div className="font-bold">App Store</div>
              </div>
            </button>
            <button className="px-6 py-3 bg-black text-white rounded-lg flex items-center">
              <i className="fab fa-google-play text-2xl mr-3" />
              <div>
                <div className="text-xs">Get it on</div>
                <div className="font-bold">Google Play</div>
              </div>
            </button>
          </div>
        </div>{" "}
        <div className="md:w-1/2 flex justify-center">
          <Image
            src="https://cdn-icons-png.flaticon.com/512/2965/2965300.png"
            alt="App Screenshot"
            width={256}
            height={256}
            className="app-screen w-64"
          />
        </div>
      </div>
    </section>
  );
};

export default DownloadApp;
