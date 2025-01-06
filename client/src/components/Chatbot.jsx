import React, { useState } from "react"

const Chatbot = ({ prediction }) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  const predefinedQuestions = [
    "Tell me about this disease.",
    "What crops are suitable after this disease?",
    "How can I prevent this disease in the future?",
    "What soil type is best for this crop?",
  ]

  const handleQuestion = async (question) => {
    setLoading(true)

    // Append user question to the chat
    setMessages((prev) => [...prev, { sender: "user", text: question }])

    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: `${question} [Prediction: ${prediction}]` }),
      })
      const data = await response.json()

      // Append bot response to the chat
      setMessages((prev) => [...prev, { sender: "bot", text: data.response }])
    } catch (error) {
      setMessages((prev) => [...prev, { sender: "bot", text: "Error fetching response." }])
    }
    setLoading(false)
  }

  return (
    <div className="bg-gray-100 p-4 w-full max-w-md mx-auto rounded shadow-md">
      <h2 className="text-xl font-bold text-center mb-4">Crop & Disease Chatbot</h2>

      <div className="chat-box h-64 overflow-y-scroll bg-white border rounded mb-4 p-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 p-2 rounded-lg ${
              msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-300 text-black"
            }`}
          >
            {msg.text}
          </div>
        ))}
        {loading && <p className="text-center text-gray-500">Typing...</p>}
      </div>

      <div className="flex flex-col space-y-2">
        {predefinedQuestions.map((question, index) => (
          <button
            key={index}
            onClick={() => handleQuestion(question)}
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  )
}

export default Chatbot
