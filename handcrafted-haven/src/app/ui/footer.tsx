import Link from "next/link";

export default function Footer(){
    return(
        <footer className="flex flex-col lg:flex-row justify-between px-4 py-6 gap-4 bg-blue-300">
        <p className="text-center">
          Copyright &copy; 2025 Handcrafted Haven. All rights reserved.
        </p>
        <hr />
        <span className="flex flex-row items-center justify-center flex-1 flex-wrap gap-4">
          <Link href={"#"}>About us</Link>
          <Link href={"#"}>Contact us</Link>
          <Link href={"#"}>Privacy policy</Link>
          <Link href={"#"}>Terms of service</Link>
        </span>
      </footer>
    )
}