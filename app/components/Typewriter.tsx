'use client'

import React, { useState, useEffect, useRef } from 'react'

interface TypewriterProps {
  text: string
  speed?: number
  onComplete?: () => void
  className?: string
  isDark?: boolean
}

export function Typewriter({ text, speed = 15, onComplete, className = '', isDark = false }: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Reset when text changes
    setDisplayedText('')
    setCurrentIndex(0)
    setIsComplete(false)
  }, [text])

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)

      return () => clearTimeout(timeout)
    } else if (!isComplete) {
      setIsComplete(true)
      onComplete?.()
    }
  }, [currentIndex, text, speed, isComplete, onComplete])

  // Fade animation on scroll
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100')
            entry.target.classList.remove('opacity-50')
          } else {
            entry.target.classList.add('opacity-50')
            entry.target.classList.remove('opacity-100')
          }
        })
      },
      { threshold: 0.5 }
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  // Split text into paragraphs
  const paragraphs = displayedText.split('\n\n').filter(p => p.trim())

  return (
    <div 
      ref={containerRef}
      className={`transition-opacity duration-500 ${isComplete ? 'opacity-100' : 'opacity-90'} ${className}`}
    >
      {paragraphs.map((paragraph, index) => (
        <p 
          key={index}
          className="mb-4 last:mb-0 leading-relaxed animate-fadeIn"
          style={{
            animationDelay: `${index * 100}ms`,
            animation: 'fadeIn 0.5s ease-in forwards'
          }}
        >
          {paragraph}
        </p>
      ))}
      {!isComplete && (
        <span className="inline-block w-2 h-4 ml-1 animate-pulse rounded-sm" 
          style={{ background: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}
        />
      )}
    </div>
  )
}
