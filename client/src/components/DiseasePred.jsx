import React, { useState, useEffect } from 'react'
import { FaTimes } from 'react-icons/fa'
import parse from 'html-react-parser'

function DiseasePred({ htmlResponse, setIsPredicted, isPredicted }) {
  const [htmlContent, setHtmlContent] = useState('')

  useEffect(() => {
    console.log('htmlResponse:', htmlResponse) // Debugging
    console.log('isPredicted:', isPredicted) // Debugging
    if (isPredicted && htmlResponse?.prediction) {
      setHtmlContent(htmlResponse.prediction)
    }
  }, [htmlResponse, isPredicted])

  const handleResponse = () => {
    setIsPredicted(false)
  }

  return (
    <div className="flex flex-col justify-center items-center w-2/3 bg-white text-gray-700 font-poppins font-bold shadow-md backdrop-blur-md rounded-lg p-6 relative">
      <span
        className="absolute top-2 right-2 cursor-pointer text-gray-600"
        onClick={handleResponse}
      >
        <FaTimes className="fill-green-600" />
      </span>
      {htmlContent && isPredicted ? (
        <div className="text-left font-normal text-gray-700 leading-relaxed">
          {parse(htmlContent)}
        </div>
      ) : (
        <p className="text-gray-500 italic">No prediction available</p>
      )}
    </div>
  )
}

export default DiseasePred
