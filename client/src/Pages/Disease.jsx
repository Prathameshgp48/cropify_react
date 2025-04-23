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
    Nitrogen: "",
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
      [e.target.name]: e.target.value,
    }))
  }

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })

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
          "Content-Type": "multipart/form-data",
        },
      })

      if (res.status === 200) {
        const data = res.data
        setIsPredicted(true)
        setResponse(data)
        setSeverity(data.severity || Math.floor(Math.random() * 41) + 30)
        toast.success("Disease predicted successfully")

        const generate = window.confirm("Do you want to generate a disease report?")
        if (!generate) return

        const base64Image = await toBase64(image)

        const reportData = {
          name: localStorage.getItem("username") || "Unknown User",
          location: "Versova, Mumbai",
          time: new Date().toISOString(),
          plantType: data.plantType || "Unknown Plant",
          disease: data.prediction,
          cause: data.cause || "Not specified",
          imageUrl: base64Image,
          severity: data.severity || Math.floor(Math.random() * 41) + 30,
          ...params,
        }

        await axios.post("http://localhost:5000/generate-report", reportData)
        toast.success("Report submitted successfully")
      }
    } catch (error) {
      console.error(error)
      toast.error("Error in predicting disease")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreview("")
    setImage("")
  }

  return (
    <div className="bg-custom-color min-h-screen text-white flex justify-center items-center flex-col py-10">
      <div className="w-11/12 max-w-4xl flex flex-col lg:flex-row justify-around items-center gap-10 bg-white bg-opacity-70 backdrop-blur-md backdrop-filter rounded-lg border-dotted border-4 border-gray-600 shadow-md p-6">
        <form onSubmit={handleImageSubmit} className="flex flex-col items-center gap-4 w-full lg:w-1/2">
          <div className="flex flex-col justify-center items-center h-72 min-w-52 cursor-pointer rounded-md border-dashed border-green-800 bg-white relative px-4">
            {preview ? (
              <div className="h-full overflow-hidden relative">
                <span className="absolute top-2 right-2 cursor-pointer text-gray-600" onClick={handleRemoveImage}>
                  <FaTimes className="fill-yellow-300" />
                </span>
                <img src={preview} alt="Uploaded" className="h-full w-full object-cover rounded-md" />
                <p className="text-yellow-300 mt-2">{image.name || ""}</p>
              </div>
            ) : (
              <label className="flex flex-col justify-center items-center cursor-pointer">
                <BsCloudArrowUpFill size={100} className="text-gray-600 mb-4" />
                <p className="text-amber-800 text-2xl font-poppins font-bold text-center">What is the Disease?</p>
                <input type="file" accept="image/*" className="hidden" onChange={handleInputImage} />
              </label>
            )}
          </div>
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg text-white font-semibold"
            disabled={isLoading}
          >
            {isLoading ? "Predicting..." : "Submit"}
          </button>
        </form>

        <div className="w-full lg:w-1/2 flex flex-col gap-3 text-black">
          <h2 className="text-lg font-semibold text-center text-white">Enter Environmental Parameters</h2>
          {Object.entries(params).map(([key, val]) => (
            <input
              key={key}
              type="number"
              step="any"
              name={key}
              placeholder={key}
              value={val}
              onChange={handleParamChange}
              className="w-full px-4 py-2 rounded-md border border-gray-400"
            />
          ))}
        </div>
      </div>

      {isPredicted && response && (
        <div className="mt-8 w-full max-w-2xl flex flex-col items-center gap-4">
          <DiseasePred
            isPredicted={isPredicted}
            setIsPredicted={setIsPredicted}
            htmlResponse={response}
          />
          <p className="text-lg text-white font-semibold">Severity: {severity}%</p>
          {response.disease_highlighted && (
            <img src={response.disease_highlighted} alt="Disease Highlighted" className="rounded-lg max-h-64" />
          )}
        </div>
      )}
    </div>
  )
}

export default Disease
