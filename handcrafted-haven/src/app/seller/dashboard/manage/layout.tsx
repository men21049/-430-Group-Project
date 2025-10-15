import Link from "next/link"

export default function Layout({children, params}: {children: React.ReactNode, params: any}) {
    return(
        <div>
            {children}
        </div>
    )
}