import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const severityColor = (severity) => {
  if (severity >= 75) return 'bg-red-600';
  if (severity >= 50) return 'bg-yellow-500';
  if (severity >= 25) return 'bg-green-500';
  return 'bg-blue-400';
};

export default function CropDiseaseReport({ report }) {
  const reportData = {
    name: report.name || 'Unknown User',
    location: report.location || 'Versova, Mumbai',
    time: report.time || new Date().toLocaleString(),
    plant: report.plantType || 'Unknown Plant',
    disease: report.disease || 'Unknown Disease',
    severity: report.severity || 68,
    cause: report.cause || 'Not specified',
    image: report.imageUrl || '/sample-disease-image.png', // Replace with actual path
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 mt-32">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="max-w-4xl mx-auto"
      >
        <Card className="shadow-xl border rounded-2xl p-4">
          <CardContent>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-green-700">Crop Disease Report</h1>
                <p className="text-sm text-gray-500">Generated for Government Support Submission</p>
              </div>
              <Badge variant="destructive">Severity: {reportData.severity}%</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <p><strong>Name:</strong> {reportData.name}</p>
                <p><strong>Location:</strong> {reportData.location}</p>
                <p><strong>Time of Report:</strong> {reportData.time}</p>
                <p><strong>Plant Type:</strong> {reportData.plant}</p>
                <p><strong>Disease Detected:</strong> <span className="text-red-600 font-medium">{reportData.disease}</span></p>
                <p><strong>Cause:</strong> {reportData.cause}</p>
              </div>

              <div className="flex flex-col items-center justify-center space-y-4">
                <img 
                  src={reportData.image} 
                  alt="Disease Example" 
                  className="w-full h-64 object-cover rounded-xl shadow-md border"
                />
                <div className="w-full">
                  <p className="mb-1 text-sm">Severity Level</p>
                  <Progress value={reportData.severity} className={severityColor(reportData.severity)} />
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center space-x-3">
              <AlertCircle className="text-yellow-600" />
              <p className="text-sm text-yellow-700">
                Please verify this report with your local agriculture officer for scheme eligibility.
              </p>
            </div>

            <div className="mt-6 text-right">
              <Button className="bg-green-600 hover:bg-green-700">Download PDF</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
