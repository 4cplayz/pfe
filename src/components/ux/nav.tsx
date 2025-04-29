"use client"

import Link from "next/link"
import Image from "next/image"
import { ThemeSwitcher } from "../theme/themeSwitcher"
import { BookOpen, PenTool, Calendar, FileText } from 'lucide-react';
import DynamicSvg from "./dynamicSvg";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur px-4">
      <nav className=" flex w-full h-[8vh] items-center">
        <div className="flex flex-1 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen size={24} strokeWidth={1.5} />
            <DynamicSvg/>
          </Link>
          <div className="flex items-center">
            <ThemeSwitcher />
          </div>
        </div>
      </nav>
    </header>
  )
}