import { motion } from "framer-motion"

const Modal = ({ isOpen, onClose, recommendation }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="bg-white p-6 rounded-lg shadow-lg w-96 text-center"
      >
        <h2 className="text-2xl font-bold text-green-600 mb-2">Recommended Crop</h2>
        <p className="text-lg font-semibold text-gray-700">{recommendation}</p>
        <button
          onClick={onClose}
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Close
        </button>
      </motion.div>
    </div>
  )
}

export default Modal
