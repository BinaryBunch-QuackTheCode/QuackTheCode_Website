import React from "react";
import { useEffect } from "react";
import axios from "axios";
function LeetQuestion({ LeetInfo }) {
  const { title, question, example, difficulty } = LeetInfo
  return (
    <div className="max-h-[100vh] w-[100vw] p-2 md:p-3 text-sm md:text-lg xl:w-[50vw] overflow-y-auto">
      <h1 className='font-bold text-lg'>
        {title}
      </h1>
      <p className={`bg-[#3f3f3f] w-fit p-2 ${(difficulty === 'Easy') ? 'text-green-500' : 'text-white'} font-medium rounded-sm my-2 text-sm`}>
        {difficulty}
      </p>
      <br />
      <p className="whitespace-pre-wrap">
        {question}
      </p>
      <br />
      {example.map((ex, idx) =>
      <div>
        <p className="font-bold">Example #{idx + 1}</p>
        <div className="bg-[#191919] text-white rounded-sm p-4 mx-auto my-2">
          <p>
            {ex.input}
          </p>
          <p>
            {ex.output}
          </p>
        </div>
      </div>
      )
      }
    </div>
  )
}

export default LeetQuestion