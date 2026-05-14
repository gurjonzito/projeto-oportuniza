import type { ReactNode } from "react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

interface Props {
  children: ReactNode
}

export default function MainLayout({ children }: Props) {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <main className="pt-24">{children}</main>
      <Footer />
    </div>
  )
}