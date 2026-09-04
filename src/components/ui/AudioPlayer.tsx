import { useRef, useState } from 'react'
import { Play, Pause, Volume2, Download } from 'lucide-react'

interface AudioPlayerProps {
  url: string
  label?: string
}

export function AudioPlayer({ url, label }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  const toggle = () => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setPlaying(!playing)
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100)
    }
  }

  const handleLoaded = () => {
    if (audioRef.current) setDuration(audioRef.current.duration)
  }

  const handleEnded = () => setPlaying(false)

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    audioRef.current.currentTime = pct * audioRef.current.duration
  }

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  // Extract filename from URL for download
  const filename = url.split('/').pop()?.split('?')[0] || 'audio'

  return (
    <div className="w-full rounded-lg border border-white/8 bg-white/3 p-2.5">
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoaded}
        onEnded={handleEnded}
      />
      <div className="flex items-center gap-2.5">
        <button
          onClick={toggle}
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-violet-600/80 hover:bg-violet-500 transition-colors"
        >
          {playing ? <Pause size={12} className="text-white" /> : <Play size={12} className="text-white ml-0.5" />}
        </button>

        <div className="flex-1 min-w-0">
          {label && <p className="text-[10px] text-gray-400 mb-1 truncate">{label}</p>}
          <div
            className="h-1 rounded-full bg-white/10 cursor-pointer overflow-hidden"
            onClick={handleSeek}
          >
            <div
              className="h-full rounded-full bg-violet-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <Volume2 size={10} style={{ color: 'rgba(255,255,255,0.3)' }} />
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {formatTime(duration)}
          </span>
          <a
            href={url}
            download={filename}
            target="_blank"
            rel="noopener noreferrer"
            title="Download audio"
            className="flex items-center justify-center w-6 h-6 rounded hover:bg-white/10 transition-colors"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
          >
            <Download size={11} />
          </a>
        </div>
      </div>
    </div>
  )
}
