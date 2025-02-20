import React, { useState } from 'react';
import axios from 'axios';

const FertilizerRecomm = () => {
  const [N, setN] = useState('');
  const [P, setP] = useState('');
  const [K, setK] = useState('');
  const [crop, setCrop] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requestData = {
      N: parseInt(N),
      P: parseInt(P),
      K: parseInt(K),
      crop: crop.toLowerCase(),
    };

    try {
      const response = await axios.post('http://localhost:5000/fertilizer-recommend', requestData);
      setRecommendation(response.data.recommendation);
      setError('');
    } catch (err) {
      setError('Error fetching fertilizer recommendation');
      setRecommendation('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-center text-green-700 mb-6">Fertilizer Recommendation</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="crop" className="block font-semibold">Crop Name:</label>
            <input
              type="text"
              id="crop"
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              placeholder="Enter Crop Name"
              required
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label htmlFor="N" className="block font-semibold">Nitrogen (N):</label>
            <input
              type="number"
              id="N"
              value={N}
              onChange={(e) => setN(e.target.value)}
              placeholder="Enter Nitrogen level"
              required
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label htmlFor="P" className="block font-semibold">Phosphorus (P):</label>
            <input
              type="number"
              id="P"
              value={P}
              onChange={(e) => setP(e.target.value)}
              placeholder="Enter Phosphorus level"
              required
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label htmlFor="K" className="block font-semibold">Potassium (K):</label>
            <input
              type="number"
              id="K"
              value={K}
              onChange={(e) => setK(e.target.value)}
              placeholder="Enter Potassium level"
              required
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
            Get Recommendation
          </button>
        </form>

        {recommendation && (
          <div className="mt-6 p-4 bg-green-100 border border-green-400 rounded-lg">
            <h3 className="font-semibold text-green-700">Recommendation:</h3>
            <p>{recommendation}</p>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-400 rounded-lg">
            <h3 className="font-semibold text-red-700">Error:</h3>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FertilizerRecomm;
