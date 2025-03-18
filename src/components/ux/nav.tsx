"use client"

import Link from "next/link"
import Image from "next/image"
import { ThemeSwitcher } from "../theme/themeSwitcher"
import { BookOpen, PenTool, Calendar, FileText } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur px-4">
      <div className="container flex h-14 items-center">
        <div className="flex flex-1 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen size={24} strokeWidth={1.5} />
          </Link>
          <nav className="flex items-center gap-4">
            <ThemeSwitcher />
          </nav>
        </div>
      </div>
    </header>
  )
}