import Link from "next/link"
import {BookOpen, FilePen} from "lucide-react"
import { Button } from "./ui/button"

function Header() {
  return (
    <header className="relative p-16 text-center">
      <Link href="/">
        <h1 className="text-6xl font-black">NovelTeller AI</h1>
        <div className="flex justify-center whitespace-nowrap space-x-5 text-3xl lg:text-5xl">
            <h2>Bringing your stores</h2>
            <div className="relative">
                <div className="absolute bg-purple-500  -rotate-1 " >
                    <p className="relative text-white">To life!</p>
                </div>
            </div>
        </div>
      </Link>

      {/* Nav icons */}
      <div className="absolute -top-5 right-5 flex space-x-2">

        <div className="inline">
            <Button>connect wallet</Button>
        </div>

        <Link href="/">
            <FilePen className="w-8 h-8 lg:w-10 lg:h-10 mx-auto 
            text-purple-500 mt-10 border border-purple-500 p-2 rounded-md hover:opacity-50 cursor-pointer" />
        </Link>

        <Link href="/story">
            <BookOpen
                className="w-8 h-8 lg:w-10 lg:h-10 mx-auto 
            text-purple-500 mt-10 border border-purple-500 p-2 rounded-md hover:opacity-50 cursor-pointer"
            />
        </Link>
      </div>
    </header>
  )
}

export default Header
