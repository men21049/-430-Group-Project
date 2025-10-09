import Link from "next/link"

export default function Manage(){

    return(
        <ul className="flex flex-col gap-2 items-center p-3 h-screen">
            <li className="w-full text-center bg-gray-100 p-3 rounded-md">
                <Link href="manage/create" className="font-semibold">Create new product</Link>
            </li>
            <li className="w-full text-center bg-gray-100 p-3 rounded-md">
                <Link href="manage/update" className="font-semibold">Update product</Link>
            </li>
            <li className="w-full text-center bg-gray-100 p-3 rounded-md">
                <Link href="manage/delete" className="font-semibold">Delete product</Link>
            </li>
            
        </ul>
    )
}