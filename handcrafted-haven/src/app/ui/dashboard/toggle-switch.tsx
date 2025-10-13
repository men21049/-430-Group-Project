"use client";
<<<<<<< HEAD
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
=======

import React, { useEffect, useState } from "react";

type ToggleSwitchProps = {
  /** Controlled checked value. If omitted, component is uncontrolled. */
  checked?: boolean;
  /** Called when switch changes. Receives the new checked state. */
  onChange?: (checked: boolean) => void;
  /** Disable the control */
  disabled?: boolean;
  /** Accessible label */
  ariaLabel?: string;
  /** Extra classes for the wrapper */
  className?: string;
};

export default function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  ariaLabel = "Toggle",
  className = "",
}: ToggleSwitchProps) {
  const isControlled = typeof checked === "boolean";
  const [internalChecked, setInternalChecked] = useState<boolean>(checked ?? false);

  // keep internal state in sync if controlled prop changes
  useEffect(() => {
    if (isControlled) setInternalChecked(checked as boolean);
  }, [checked, isControlled]);

  const toggle = () => {
    if (disabled) return;
    const next = !internalChecked;
    if (!isControlled) setInternalChecked(next);
    onChange?.(next);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggle();
    }
  };

  const trackClass = internalChecked ? "bg-green-500" : "bg-gray-300";
  const knobTransform = internalChecked ? "translate-x-4" : "translate-x-0";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={internalChecked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={toggle}
      onKeyDown={handleKey}
      className={`relative inline-flex items-center focus:outline-none ${className} ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {/* Track */}
      <span
        aria-hidden
        className={`block w-10 h-6 rounded-full transition-colors duration-200 ${trackClass}`}
      />
      {/* Knob */}
      <span
        aria-hidden
        className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ${knobTransform}`}
      />
    </button>
>>>>>>> d56f8fa33e8290ebf0687d86059b4b72d4daa6c4
  );
}
