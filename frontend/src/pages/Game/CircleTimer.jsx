import React from "react";
import { useState, useEffect } from "react";

const CircleTimer = ({ endTime, duration }) => {
  const startingTime = duration * 1000;
  const [timeLeft, setTimeLeft] = useState(startingTime);
  const elapsed = ((startingTime - timeLeft) / startingTime) * 100;
  useEffect(() => {
    const tick = () => {
      const remaining = Math.max(0, (endTime - Date.now()));
      setTimeLeft(remaining);
      if (remaining > 0) raf = requestAnimationFrame(tick);
    };
    let raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [endTime]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-10 h-10">
        {/* The pie circle */}
        <div
          className="w-full h-full rounded-full transition-all duration-1000 ease-linear"
          style={{
            background: `conic-gradient(
              from 0deg,
              #F0E8D0 0% ${elapsed}%,
             ${timeLeft <= startingTime / 4 ? '#ff0000' : timeLeft <= startingTime / 2 ? '#fffb00' : '#3bf68c'} ${elapsed}% 100%
            )`,
          }}
        />
        {/* Centered text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-black">{Math.ceil(timeLeft / 1000)}</span>
        </div>
      </div>
    </div>
  );
};

export default CircleTimer