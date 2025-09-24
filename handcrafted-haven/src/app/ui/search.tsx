'use client'
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

//This means that Search component accepts the same props as a label and a placeholder
interface SearchProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    placeholder: string;
}

export default  function Search({placeholder, className,...rest}:SearchProps) {

    return(
        <label {...rest}  className={`flex flex-row items-center gap-2 border bg-white border-gray-300 py-2 px-3 rounded-md ${className}`}>
            <MagnifyingGlassIcon className="w-5 h-5 cursor-pointer" />
            <input type="text" name="search" placeholder={placeholder} className="outline-none w-full"/>
        </label>
    )
}