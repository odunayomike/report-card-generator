import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">
          Report Card Generator
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Welcome to your React + Vite + Tailwind CSS app
        </p>

        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => setCount((count) => count + 1)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
          >
            Count is {count}
          </button>

          <p className="text-sm text-gray-500">
            Click the button to test interactivity
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
