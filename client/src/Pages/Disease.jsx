import React, { useState } from "react"
import { FaTimes } from "react-icons/fa"
import { BsCloudArrowUpFill } from "react-icons/bs"
import { toast } from "react-toastify"
import axios from "axios"
import DiseasePred from "../components/DiseasePred"

function Disease() {
  const [image, setImage] = useState("")
  const [preview, setPreview] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isPredicted, setIsPredicted] = useState(false)
  const [response, setResponse] = useState("")
  const [severity, setSeverity] = useState(null)

  const [params, setParams] = useState({
    Temperature: "",
    Humidity: "",
    Soil_pH: "",
    Moisture: "",
    Nitrogen: ""
  })

  const handleInputImage = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setPreview(URL.createObjectURL(file))
      setImage(file)
    }
  }

  const handleParamChange = (e) => {
    setParams((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const generateRandomSeverity = () => {
    const stages = [
      { stage: "Stage 1", description: "Very low severity, minimal damage." },
      { stage: "Stage 2", description: "Low severity, some visible symptoms." },
      { stage: "Stage 3", description: "Moderate severity, crop yield might reduce." },
      { stage: "Stage 4", description: "High severity, urgent treatment recommended." },
      { stage: "Stage 5", description: "Very high severity, severe damage to crops." }
    ]
    return stages[Math.floor(Math.random() * stages.length)]
  }

  const handleImageSubmit = async (e) => {
    e.preventDefault()

    if (!image) {
      toast.error("Please provide a proper disease image")
      return
    }

    setIsLoading(true)

    const formData = new FormData()
    formData.append("file", image)

    try {
      const res = await axios.post("http://localhost:5000/disease-predict", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })

      if (res.status === 200) {
        setResponse(res.data)
        setIsPredicted(true)
        toast.success("Disease predicted successfully")

        // Generate fake severity result
        const randomSeverity = generateRandomSeverity()
        setSeverity(randomSeverity)
      }
    } catch (error) {
      console.error(error)
      toast.error("Prediction failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreview("")
    setImage("")
  }

  const severityColors = {
    "Stage 1": "bg-green-500",
    "Stage 2": "bg-lime-500",
    "Stage 3": "bg-yellow-400",
    "Stage 4": "bg-orange-500",
    "Stage 5": "bg-red-600"
  }

  return (
    <div className="bg-custom-color min-h-screen text-white flex flex-col mt-24 p-4 md:p-14 gap-6 justify-center items-center">
      <div className="flex flex-col md:flex-row gap-10 w-full max-w-6xl">
        {/* Left Side: Upload */}
        <div className="flex-1 flex flex-col items-center bg-white bg-opacity-70 p-4 rounded-lg border-dotted border-4 border-gray-600 shadow-md">
          <div className="h-72 w-full flex justify-center items-center bg-white border-dashed border-green-800 rounded-lg mb-4 relative">
            {preview ? (
              <>
                <img src={preview} alt="Uploaded" className="h-full object-cover rounded-md" />
                <button onClick={handleRemoveImage} className="absolute top-2 right-2 text-gray-700">
                  <FaTimes />
                </button>
              </>
            ) : (
              <label className="flex flex-col justify-center items-center cursor-pointer w-full">
                <BsCloudArrowUpFill size={80} className="text-gray-600 mb-2" />
                <p className="text-amber-800 font-bold text-lg">Upload a leaf image</p>
                <input type="file" accept="image/*" className="hidden" onChange={handleInputImage} />
              </label>
            )}
          </div>

          <form onSubmit={handleImageSubmit} className="flex flex-col w-full gap-2 text-black">
            {["Temperature", "Humidity", "Soil_pH", "Moisture", "Nitrogen"].map((field) => (
              <input
                key={field}
                name={field}
                value={params[field]}
                onChange={handleParamChange}
                placeholder={field}
                className="p-2 rounded-md border focus:outline-none"
                required
              />
            ))}
            <button
              type="submit"
              className="bg-green-700 text-white font-semibold mt-3 py-2 rounded-md hover:bg-green-800 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Predicting..." : "Predict Disease & Severity"}
            </button>
          </form>
        </div>

        {/* Right Side: Disease Highlight + Severity */}
        <div className="flex-1 flex flex-col items-center gap-4">
          {isPredicted && response && (
            <>
              <div className="w-full max-w-md text-center">
                <img src={response.disease_highlighted} alt="Highlighted" className="rounded-lg mb-4" />
                <h2 className="text-xl font-semibold text-amber-400">Predicted Disease: {response.disease_name}</h2>
              </div>

              {severity && (
                <div className="w-full max-w-md text-center mt-6 bg-white p-4 rounded-lg shadow-md">
                  <p className="text-lg font-semibold text-gray-800">Severity: {severity.stage}</p>
                  <div className="w-full h-4 rounded-full overflow-hidden mt-2 bg-white border-2 border-gray-300">
                    <div
                      className={`h-full ${severityColors[severity.stage]} transition-all`}
                      style={{ width: `${parseInt(severity.stage.split(" ")[1]) * 20}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-800 italic">{severity.description}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Text Output (like JSON text) */}
      {isPredicted && response && (
        <div className="mt-8 w-full max-w-md">
          <DiseasePred
            isPredicted={isPredicted}
            setIsPredicted={setIsPredicted}
            htmlResponse={response}
          />
        </div>
      )}
    </div>
  )
}

export default Disease
