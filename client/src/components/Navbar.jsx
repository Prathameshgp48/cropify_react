import React from "react";
import Logo from "../logo.svg";
import { Link, useMatch } from "react-router-dom";

function Navbar() {
  const isHome = useMatch("/");
  const isRecommend = useMatch("/crop-recommendation");
  const isDisease = useMatch("/disease-prediction");
  const isRecords = useMatch("/records");
  const isFertilizer = useMatch("/fertilizer-recommendation");

  return (
    <div className="fixed top-4 left-4 right-4 rounded-lg shadow-mg flex justify-center items-center h-20 bg-white bg-opacity-75 backdrop-filter backdrop-blur-md p-4 z-50">
      <Link to="/" className="flex items-center">
        <img className="h-10 w-10 mr-10" src={Logo} alt="Logo" />
      </Link>
      <div className="list-none flex space-x-10 text-gray-800">
        <Link
          to="/"
          className={`font-poppins text-xl font-bold hover:text-yellow-600 cursor-pointer ${
            isHome ? "text-yellow-600" : ""
          }`}
        >
          Home
        </Link>

        <Link
          to="/crop-recommendation"
          className={`font-poppins text-xl font-bold hover:text-yellow-600 cursor-pointer ${
            isRecommend ? "text-yellow-600" : ""
          }`}
        >
          Recommend me.
        </Link>

        <Link
          to="/disease-prediction"
          className={`font-poppins text-xl font-bold hover:text-yellow-600 cursor-pointer ${
            isDisease ? "text-yellow-600" : ""
          }`}
        >
          Disease
        </Link>
        <Link
          to="/fertilizer-recommendation"
          className={`font-poppins text-xl font-bold hover:text-yellow-600 cursor-pointer ${
            isDisease ? "text-yellow-600" : ""
          }`}
        >
          Fertilizer 
        </Link>
        <Link
          to="/records"
          className={`font-poppins text-xl font-bold hover:text-yellow-600 cursor-pointer ${
            isRecords ? "text-yellow-600" : ""
          }`}
        >
          Records
        </Link>
      </div>
    </div>
  );
}

export default Navbar;
