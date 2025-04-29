"use client"
import React, { useEffect, useState } from "react"
import { useTheme } from "next-themes"

const DynamicSvg: React.FC = () => {
  const [svgContent, setSvgContent] = useState<string | null>(null)
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Use resolvedTheme if theme is "system"
    const currentTheme = theme === "system" ? resolvedTheme : theme
    const filePath =
      currentTheme === "dark"
        ? "/iato_500x500_W.svg"
        : "/iato_500x500_B.svg"

    const loadSvg = async () => {
      try {
        const response = await fetch(filePath)
        const svgText = await response.text()
        setSvgContent(svgText)
      } catch (error) {
        console.error("Error loading SVG:", error)
      }
    }

    loadSvg()
  }, [mounted, theme, resolvedTheme])

  if (!mounted || !svgContent) return null

  return (
    <div
      // The transform scales the logo 2x while keeping the top-left corner as the origin
      className="ml-3"
      style={{ transform: "scale(4)", transformOrigin: "center" }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
      aria-hidden="true"
    />
  )
}

export default DynamicSvg