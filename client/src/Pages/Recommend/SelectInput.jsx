import React, { useState } from 'react'
import data from './state_city_data.json'

function SelectInput(props) {
  const [selectState, setSelectState] = useState('')
  const [cities, setCities] = useState([])
  const [selectCity, setSelectCity] = useState('')
  
  const handleStateChange = (e) => {
    const state = e.target.value
    setSelectState(state)
    props.setState(state)
    setCities(data[state] || [])
    setSelectCity('')
  }

  const handleCityChange = (e) => {
    const city = e.target.value
    setSelectCity(city)
    props.setCity(city)
  }

  return (
    <div className="flex justify-between items-center w-full">
          <div className="flex flex-col w-1/2 px-2">
            <label className="mb-2 text-gray-800 font-bold">Select State</label>
            <select
              id = "state"
              value={selectState}
              onChange={handleStateChange}
              className="block appearance-none w-full bg-white border text-gray-600 font-bold border-gray-300 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            >
                <option value="" className="bg-gray-500 text-white">Select state</option>
              {
                Object.keys(data).map((state) => (
                    <option key={state} value={state} >
                      {state}
                    </option>
                ))
              }
            </select>
          </div>
          <div className="flex flex-col w-1/2 px-2">
          <label className="mb-2 text-gray-800 font-bold">Select City</label>
            <select
              value={selectCity}
              onChange={handleCityChange}
              className="block appearance-none w-full bg-white text-gray-600 border font-bold border-gray-300 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="" className="bg-gray-500 text-white">
                Select City
              </option>
              {
                cities.map((city) => (
                    <option key={city} value={city} >
                      {city}
                    </option>
                ))
              }
            </select>
          </div>
        </div>
  )
}

export default SelectInput
