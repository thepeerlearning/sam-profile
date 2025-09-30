"use client"

import React, { useState } from "react"
import VideoModal from "./VideoModal"

interface VideoTextTriggerProps {
  videoUrl: string
  label?: string
  className?: string
  variant?: "link" | "button" // optional styling helper
}

const VideoPlayer: React.FC<VideoTextTriggerProps> = ({
  videoUrl,
  label = "Watch video",
  className = "",
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const commonClasses =
    "text-white hover:text-white underline underline-offset-4 inline-flex gap-2 focus:outline-none cursor-pointer"

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={`${commonClasses} ${className}`}
        aria-haspopup="dialog"
        aria-expanded={isModalOpen}
      >
        <span className="underline">{label}</span>
      </button>

      <VideoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        videoUrl={videoUrl}
      />
    </>
  )
}

export default VideoPlayer
