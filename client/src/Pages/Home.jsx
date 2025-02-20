import React from "react"
import Navbar from "../components/Navbar"
import { motion } from "framer-motion"

function Home() {
  return (
    <div>
      <div
        className="relative min-h-screen bg-cover bg-center flex items-center justify-center text-white px-4"
        style={{ backgroundImage: `url(/assets/bgimg.jpg)` }}
      >
        <motion.div className="text-center" initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <h1 className="text-6xl font-bold">CropiFy</h1>
          <p className="text-xl mt-2">Agro Company</p>
          <motion.button whileHover={{ scale: 1.1 }} className="mt-6 bg-yellow-500 px-6 py-3 rounded-full hover:bg-yellow-400 transition-all">
            Discover
          </motion.button>
        </motion.div>
      </div>

      <div className="mt-10 px-6 md:px-16 lg:px-32">
        <h1 className="text-3xl font-semibold text-center mb-8">Our Services</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-all"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <img className="w-20 h-20 mb-4" src={service.img} alt={service.title} />
              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <motion.button whileHover={{ scale: 1.1 }} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all">
                Click Here
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-16 px-6 md:px-16 lg:px-32 text-center">
        <h1 className="text-3xl font-semibold mb-6">Why Choose Us?</h1>
        <p className="text-gray-700 mb-6">We provide expert recommendations for crop selection, disease prediction, and fertilizer usage to maximize your agricultural productivity.</p>
      </div>

      <div className="mt-10 px-6 md:px-16 lg:px-32">
        <h1 className="text-3xl font-semibold text-center mb-8">Testimonials</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-all"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <p className="text-gray-600 italic">"{testimonial.quote}"</p>
              <h3 className="text-lg font-semibold mt-4">- {testimonial.author}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

const services = [
  {
    img: "assets/crop.gif",
    title: "Crop",
    description:
      "Suggests the most suitable crops to be grown based on environmental and climatic conditions."
  },
  {
    img: "assets/dis.gif",
    title: "Crop Disease",
    description:
      "Predicts crop name and diseases, identifies causes, and provides effective solutions."
  },
  {
    img: "assets/fert.gif",
    title: "Fertilizer",
    description:
      "Advises on ideal fertilizers for specific soil and recommends compatible crops."
  }
]

const testimonials = [
  {
    quote: "CropiFy helped me choose the best crops for my farm and improved my yield significantly!",
    author: "Farmer A"
  },
  {
    quote: "Thanks to CropiFy, I was able to detect diseases early and save my crops!",
    author: "Farmer B"
  },
  {
    quote: "The fertilizer recommendations were spot on! Highly recommended!",
    author: "Farmer C"
  }
]

export default Home
