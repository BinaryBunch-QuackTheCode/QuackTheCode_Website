import React from "react";
import { useEffect } from "react";
import axios from "axios";
import CircleTimer from "./CircleTimer";
function LeetQuestion({ LeetInfo, endTime, duration}) {
  const { title, question, example, difficulty } = LeetInfo
  return (
    <div className="max-h-[100vh] w-[100vw] p-2 md:p-3 text-sm md:text-lg xl:w-[50vw] overflow-y-auto bg-[#F0E8D0]">
      <div className="flex items-center justify-between">
        <h1 className='font-bold text-lg font-["Press_Start_2P"]'>
          {title}
        </h1>
        <CircleTimer endTime={endTime} duration={duration}/>
      </div>
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
        <div class="bg-[#D4874B] border-4 border-[#5C3A1F] 
            shadow-[4px_4px_0px_0px_#5C3A1F]
            hover:translate-x-[2px] hover:translate-y-[2px]
            hover:shadow-[2px_2px_0px_0px_#5C3A1F]
            px-6 py-3 font-['Press_Start_2P'] text-[#3D2614]
            cursor-pointer transition-all text-sm m-4">
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