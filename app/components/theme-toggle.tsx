'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { FiSun, FiMoon } from 'react-icons/fi'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const toggleTheme = () => {
    // If currently using system theme, switch to the opposite of what system prefers
    if (theme === 'system') {
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
    } else {
      // If already using a manual theme, toggle between light and dark
      setTheme(theme === 'dark' ? 'light' : 'dark')
    }
  }

  return (
    <button className="nav-item" onClick={toggleTheme}>
      {mounted &&
        (theme === 'dark' ? (
          <FiSun className="icon-base" />
        ) : (
          <FiMoon className="icon-base" />
        ))}
    </button>
  )
}
