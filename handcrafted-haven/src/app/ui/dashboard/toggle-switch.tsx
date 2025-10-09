"use client";
import { useState } from "react";

export default function ToggleSwitch() {
  const [isChecked, setIsChecked] = useState(false);

  const handleIsChecked = () => {
    //Logic to change the state in the db
    setIsChecked(!isChecked);
  };

  return (
    <label className="inline-flex justify-between flex-row gap-4 items-center cursor-pointer">
      <span>Disable Product ?</span>
      <input
        type="checkbox"
        value=""
        className="sr-only peer"
        checked={isChecked}
        onChange={handleIsChecked}
      />
      <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus-visible:ring-4 peer-focus-visible:ring-blue-300 dark:peer-focus-visible:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600 dark:peer-checked:bg-green-600"></div>
    </label>
  );
}
