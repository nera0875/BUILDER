'use client'

import { useEffect, useRef, useState } from 'react'

interface VncViewerProps {
  url: string
  title?: string
  vncWidth?: number
  vncHeight?: number
}

export function VncViewer({
  url,
  title = "VNC Viewer",
  vncWidth = 1920,
  vncHeight = 1080
}: VncViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return

      const containerWidth = containerRef.current.clientWidth
      const containerHeight = containerRef.current.clientHeight

      // Add padding to avoid cutting off window borders
      const paddingX = 20
      const paddingY = 40

      // Calculate scale to fit container while maintaining aspect ratio
      const scaleX = (containerWidth - paddingX) / vncWidth
      const scaleY = (containerHeight - paddingY) / vncHeight
      const newScale = Math.min(scaleX, scaleY, 1.5) // Max 1.5x zoom

      setScale(newScale)
    }

    // Initial scale
    updateScale()

    // Update on window resize
    window.addEventListener('resize', updateScale)

    // Also check periodically (container might resize due to sidebar, etc.)
    const interval = setInterval(updateScale, 1000)

    return () => {
      window.removeEventListener('resize', updateScale)
      clearInterval(interval)
    }
  }, [vncWidth, vncHeight])

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center bg-black overflow-hidden pt-2"
    >
      <div
        style={{
          width: `${vncWidth}px`,
          height: `${vncHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          transition: 'transform 0.3s ease-out'
        }}
      >
        <iframe
          src={url}
          className="w-full h-full border-0"
          title={title}
          allow="clipboard-read; clipboard-write"
        />
      </div>
    </div>
  )
}
