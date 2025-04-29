"use client"
import React, { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import Image from "next/image"

const DynamicSvg: React.FC = () => {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a placeholder with the same dimensions to prevent layout shift
    return <div className="w-[100px] h-[40px]" />
  }

  // Use resolvedTheme to determine which logo to display
  const currentTheme = theme === "system" ? resolvedTheme : theme
  const logoSrc = currentTheme === "dark" 
    ? "/iato_500x500_B.svg" 
    : "/iato_500x500_B.svg"

  return (
    <div className="relative w-[32px] h-[32px]">
      <Image 
        src={logoSrc}
        alt="IATO Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
  )
}

export default DynamicSvg