import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { BsCloudArrowUpFill } from 'react-icons/bs';
import { toast } from 'react-toastify';
import axios from 'axios';
import DiseasePred from '../components/DiseasePred';

function Disease() {
  const [image, setImage] = useState("")
  const [preview, setPreview ] = useState("")
  const [isPredicted, setIsPredicted] = useState(false)
  const [response, setResponse] = useState("")
  

  const handleInputImage = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      console.log(file)
      setPreview(URL.createObjectURL(file))
      setImage(file);
    }
  };

  const handleImageSubmit = async (e) => {
    e.preventDefault()

    if(image === "") {
       toast.error("Please provide proper disease image")
       return
    }
    
    const formData = new FormData()
    formData.append("file", image)

    try {
      const response = await axios.post("http://localhost:5000/disease-predict", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })
      if(response.status === 200) {
        console.log(response.data.prediction)
        setIsPredicted(true)
        setResponse(response.data)
        toast.success("Disease predicted successfully")
      }
    } catch (error) {
       console.log(error)
        toast.error("Error in predicting disease")
    }
  }

  const handleRemoveImage = () => {
    setPreview("");
    setImage("");
  };

  return (
    <div className="bg-custom-color h-screen text-white flex justify-center items-center">
      <div className="w-3/4 h-96 flex flex-col justify-around items-center bg-white bg-opacity-70 backdrop-blur-md backdrop-filter rounded-lg border-dotted border-4 border-gray-600 shadow-md">
        <div className="flex flex-col justify-center items-center h-72 min-w-52 cursor-pointer rounded-md border-dashed border-green-800 bg-white relative px-4">
          {preview ? (
            <div className="h-full overflow-hidden relative">
              <span className="absolute top-2 right-2 cursor-pointer text-gray-600" onClick={handleRemoveImage}>
                <FaTimes className="fill-yellow-300" />
              </span>
              <img src={preview} alt="Uploaded" className="h-full w-full object-cover rounded-md" />
              <p className="text-yellow-300 mt-2">{image.file?.name || ""}</p>
            </div>
          ) : (
            <label className="flex flex-col justify-center items-center cursor-pointer">
              <BsCloudArrowUpFill size={100} className="text-gray-600 mb-4" />
              <p className="text-amber-800 text-2xl font-poppins font-bold text-center">What is the Disease?</p>
              <input type="file" accept="image/*" value={image} className="hidden" onChange={handleInputImage} />
            </label>
          )}
        </div>
        <button onClick={handleImageSubmit} className="w-4/5 mt-4 bg-custom-color text-xl text-white py-2 rounded-lg">Predict the Disease</button>
      </div>
      {isPredicted && response && (
        <DiseasePred
          isPredicted={isPredicted}
          setIsPredicted={setIsPredicted}
          htmlResponse={response}
        />
      )}
    </div>
  );
}

export default Disease;