import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import CropDiseaseReport from './CropDiseaseReport.jsx';
function Reports() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get("http://localhost:5000/get-reports");
        setReports(res.data);
      } catch (err) {
        console.error("Failed to fetch reports", err);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 text-black p-8">
      <h1 className="text-3xl font-bold mb-4">Submitted Disease Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report, index) => (
          <div
            key={index}
            onClick={() => setSelectedReport(report)}
            className="cursor-pointer border rounded-lg shadow-md p-4 bg-white hover:bg-gray-50"
          >
            <p><strong>Date:</strong> {new Date(report.time).toLocaleDateString()}</p>
            <p><strong>Time:</strong> {new Date(report.time).toLocaleTimeString()}</p>
            <p><strong>Location:</strong> {report.location}</p>
          </div>
        ))}
      </div>

      {selectedReport && (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Report Details</h2>
          <CropDiseaseReport report={selectedReport} />
        </div>
      )}
    </div>
  );
}

export default Reports;
