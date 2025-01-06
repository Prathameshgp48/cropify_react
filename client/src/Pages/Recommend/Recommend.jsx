import React, { useState } from "react"
import SelectInput from "./SelectInput"
import { Bounce, toast } from "react-toastify"
import axios from "axios"

function Recommend() {
  const [nitrogen, setNitrogen] = useState("")
  const [phosphorous, setPhosphorous] = useState("")
  const [potassium, setPotassium] = useState("")
  const [ph, setPh] = useState("")
  const [rainfall, setRainfall] = useState("")
  const [state, setState] = useState("")
  const [city, setCity] = useState("")

  const handleInputChange = (e) => {
    const { name, value } = e.target
    switch(name) {
      case "Nitrogen":
        setNitrogen(value || "")
        break
      case "Phosphorous":
        setPhosphorous(value || "")
        break
      case "Potassium":
        setPotassium(value || "")
        break
      case "PH":
        setPh(value || "")
        break
      case "Rainfall":
        setRainfall(value || "")
        break
      default:
        break
    }
  }

  const handleFormSubmit = async(e) => {
    e.preventDefault()
    
    if(!nitrogen || !phosphorous || !potassium || !ph || !rainfall || !state || !city) {
      toast.error('Please fill all the fields',{
        position: "top-right",
        autoClose: 5000,
        closeOnClick: true,
        hideProgressBar: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
      })
      return
    }

    console.log(nitrogen)
    const formData = new FormData()
    formData.append("N", nitrogen)
    formData.append("P", phosphorous)
    formData.append("K", potassium)
    formData.append("ph", ph)
    formData.append("rainfall", rainfall)
    formData.append("state", state)
    formData.append("city", city)
    
    try {
      const response = await axios.post("http://localhost:5000/crop-recommend", formData)
      if(response.status === 200) {
        console.log(response.data)
        toast.success("Crop recommended successfully")
      }
    } catch (error) {
      console.log(error)
      toast.error("Error in recommending crop")
    }
  }

  return (
    <div className="bg-custom-color h-screen text-white flex justify-center items-center">
      <form onSubmit={handleFormSubmit} className="flex flex-col items-center space-y-4 w-3/2 h-auto bg-white bg-opacity-75 backdrop-filter backdrop-blur-md px-4 py-6 rounded-lg shadow-md">
        <h2 className="text-2xl text-green-700 font-poppins font-bold mb-4">
          Find Ideal Crop
        </h2>
        <div className="flex justify-between items-center w-full">
          <div className="flex flex-col w-1/2 px-2">
            <label className="mb-2 text-gray-800 font-bold">Nitrogen</label>
            <input
              className="p-2 border rounded text-gray-600 font-bold"
              type="text"
              name="Nitrogen"
              value={nitrogen}
              onChange={handleInputChange}
              placeholder="Enter Nitrogen"
            />
          </div>
          <div className="flex flex-col w-1/2 px-2">
            <label className="mb-2 text-gray-800 font-bold">Phosphorous</label>
            <input
              className="p-2 border rounded text-gray-600 font-bold"
              type="text"
              name="Phosphorous"
              value={phosphorous}
              onChange={handleInputChange}
              placeholder="Enter Phosphorous"
            />
          </div>
        </div>
        <div className="flex justify-between items-center w-full">
          <div className="flex flex-col w-1/2 px-2">
            <label className="mb-2 text-gray-800 font-bold">Potassium</label>
            <input
              className="p-2 border rounded text-gray-600 font-bold"
              type="text"
              name="Potassium"
              value={potassium}
              onChange={handleInputChange}
              placeholder="Enter Potassium"
            />
          </div>
          <div className="flex flex-col w-1/2 px-2">
            <label className="mb-2 text-gray-800 font-bold">PH level</label>
            <input
              className="p-2 border rounded text-gray-600 font-bold"
              type="text"
              name="PH"
              value={ph}
              onChange={handleInputChange}
              placeholder="Enter PH"
            />
          </div>
        </div>
        <div className="flex flex-col w-full px-2">
          <label className="mb-2 text-gray-800 font-bold">Rainfall</label>
          <input
            className="p-2 border rounded text-gray-600 font-bold"
            type="text"
            name="Rainfall"
            value={rainfall}
            onChange={handleInputChange}
            placeholder="Enter Rainfall"
          />
        </div>
        <SelectInput state={state} city={city} setState={setState} setCity={setCity}/>
        <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded w-full" type="submit">Recommend Crop</button>
      </form>
    </div>
  );
}

export default Recommend;
