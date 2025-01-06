import React, { useEffect, useState } from "react"
import Navbar from "../components/Navbar";

function Home() {
  const [zoomLevel, setZoomLevel] = useState(1);

  return (
    <div
      className="relative h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(/assets/bgimg.jpg)` ,
      }}
    >
      {/* <Navbar/> */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <h1 className="text-6xl font-bold">CropiFy</h1>
        <p className="text-xl mt-2">Agro Company</p>
        <button className="mt-6 bg-yellow-500 px-6 py-3 rounded-full hover:bg-yellow-400">
          Discover
        </button>
      </div>
      {/* <div className="absolute bottom-4 flex justify-center w-full space-x-2">
        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
        <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
        <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
      </div> */}
    </div>
  );
}

export default Home
