import Link from "next/link"

export default function Layout({children, params}: {children: React.ReactNode, params: any}) {
    return(
        <div>
            <h1><Link href="/seller/dashboard/Manage">Manage</Link> / Create</h1>
            {children}
        </div>
    )
}