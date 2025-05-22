import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipForward, SkipBack, Volume2 } from "lucide-react";

const playlist = [
  {
    title: "Clubbed to Death",
    artist: "CryptoPunk",
    videoId: "pFS4zYWxzNA",
  },
  {
    title: "Tron Legacy",
    artist: "SOL Beats",
    videoId: "G6tuvKE6_lA",
  },
  {
    title: "Blockchain Anthem",
    artist: "Toby + Decap",
    videoId: "GZ0YMSLZjfQ",
  },
  {
    title: "Bitcoin Billionaire",
    artist: "Remy",
    videoId: "UG7zLhEWanc",
  },
  {
    title: "Degen",
    artist: "Web3 Pioneers",
    videoId: "imQ8NWpkD4Y",
  },
];

const MatrixBackground = ({ isPlaying }) => {
  const canvasRef = useRef(null);
  const [columns, setColumns] = useState([]);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const fontSize = 14;
    const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()';

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const columnCount = Math.floor(canvas.width / fontSize);
      setColumns(Array(columnCount).fill(0));
    };

    resize();
    window.addEventListener('resize', resize);

    const matrix = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#0F0';
      ctx.font = `${fontSize}px monospace`;

      setColumns(prevColumns => {
        return prevColumns.map((y, i) => {
          const char = charSet[Math.floor(Math.random() * charSet.length)];
          const x = i * fontSize;
          ctx.fillText(char, x, y);

          if (y > canvas.height && Math.random() > 0.975) {
            return 0;
          }
          return y + fontSize;
        });
      });

      animationRef.current = requestAnimationFrame(matrix);
    };

    if (isPlaying) {
      matrix();
    }

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 w-full h-full opacity-50 z-0"
    />
  );
};

export default function MatrixMusicPlayer() {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [player, setPlayer] = useState(null);
  const playerRef = useRef(null);
  const timeUpdateInterval = useRef(null);
  const visualizerInterval = useRef(null);
  const [visualizerData, setVisualizerData] = useState(Array(8).fill(20));

  // YouTube API setup (same as before)
  useEffect(() => {
    let youtubeScriptLoaded = false;

    const loadYouTubeAPI = () => {
      if (!window.YT) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        youtubeScriptLoaded = true;
      }
    };

    loadYouTubeAPI();

    window.onYouTubeIframeAPIReady = () => {
      if (!youtubeScriptLoaded) {
        playerRef.current = new window.YT.Player("youtube-player", {
          height: "1",
          width: "1",
          videoId: playlist[currentTrack].videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            enablejsapi: 1,
            fs: 0,
            modestbranding: 1,
            playsinline: 1,
          },
          events: {
            onReady: (event) => {
              setPlayer(event.target);
              event.target.setVolume(volume);
            },
            onStateChange: (event) => {
              setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
              if (event.data === window.YT.PlayerState.ENDED) {
                handleNext();
              }
            },
          },
        });
      }
    };

    return () => {
      if (timeUpdateInterval.current) clearInterval(timeUpdateInterval.current);
      if (visualizerInterval.current) clearInterval(visualizerInterval.current);
      if (playerRef.current) playerRef.current.destroy();
      window.onYouTubeIframeAPIReady = null;
    };
  }, []);

  useEffect(() => {
    if (!player) return;

    const updateTime = () => {
      if (player && player.getCurrentTime && player.getDuration) {
        setCurrentTime(player.getCurrentTime());
        setDuration(player.getDuration());
      }
    };

    timeUpdateInterval.current = setInterval(updateTime, 1000);
    return () => clearInterval(timeUpdateInterval.current);
  }, [player]);

  useEffect(() => {
    if (player && player.loadVideoById) {
      player.loadVideoById({
        videoId: playlist[currentTrack].videoId,
        startSeconds: 0,
      });
    }
  }, [currentTrack, player]);

  useEffect(() => {
    if (isPlaying) {
      visualizerInterval.current = setInterval(() => {
        setVisualizerData((prev) =>
          prev.map(() => Math.floor(20 + Math.random() * 60))
        );
      }, 100);
    } else {
      if (visualizerInterval.current) clearInterval(visualizerInterval.current);
    }

    return () => {
      if (visualizerInterval.current) clearInterval(visualizerInterval.current);
    };
  }, [isPlaying]);

  const handlePlayPause = () => {
    if (!player) return;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };

  const handleNext = () => {
    setCurrentTrack((prev) => (prev + 1) % playlist.length);
  };

  const handlePrev = () => {
    setCurrentTrack((prev) => (prev - 1 + playlist.length) % playlist.length);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (player) {
      player.setVolume(newVolume);
    }
  };

  const handleProgressBarClick = (e) => {
    if (!player || !duration) return;
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    player.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-md relative overflow-hidden border border-green-600 bg-black shadow-lg shadow-green-500/20">
      <div id="youtube-player" className="w-1 h-1 opacity-0 absolute pointer-events-none"></div>
      <MatrixBackground isPlaying={isPlaying} />
      
      <div className="relative z-10 p-6">
        <div className="bg-black/80 p-4 mb-4 font-omiofont1 text-green-400 border border-green-700 backdrop-blur-sm">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xl mb-2 font-omiofont1">
                {playlist[currentTrack].title}
              </div>
              <div className="text-sm text-green-500">
                {playlist[currentTrack].artist}
              </div>
              <div className="text-xs mt-2">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-end h-16 gap-0.5">
              {visualizerData.map((height, index) => (
                <div
                  key={index}
                  className="w-0.5 bg-green-400 transition-all duration-100"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        <div
          className="w-full h-2 bg-black/50 mb-4 cursor-pointer border border-green-800"
          onClick={handleProgressBarClick}
        >
          <div
            className="h-full bg-green-500"
            style={{
              width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
            }}
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <button onClick={handlePrev} className="p-2 hover:bg-green-900/30 border border-green-800/50">
            <SkipBack className="w-6 h-6 text-green-400" />
          </button>

          <button
            onClick={handlePlayPause}
            className="p-3 bg-green-900/30 hover:bg-green-800/30 border border-green-600"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-green-400" />
            ) : (
              <Play className="w-8 h-8 text-green-400" />
            )}
          </button>

          <button onClick={handleNext} className="p-2 hover:bg-green-900/30 border border-green-800/50">
            <SkipForward className="w-6 h-6 text-green-400" />
          </button>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <Volume2 className="w-5 h-5 text-green-400" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-2 bg-green-900/30 appearance-none border border-green-800 
              [&::-webkit-slider-thumb]:appearance-none 
              [&::-webkit-slider-thumb]:w-4 
              [&::-webkit-slider-thumb]:h-4 
              [&::-webkit-slider-thumb]:bg-green-400 
              [&::-webkit-slider-thumb]:border-2 
              [&::-webkit-slider-thumb]:border-green-900"
          />
        </div>

        <div className="mt-4 bg-black/80 p-2 max-h-40 overflow-auto border border-green-800/50 backdrop-blur-sm
          [&::-webkit-scrollbar]:w-2
          [&::-webkit-scrollbar-track]:bg-black/30
          [&::-webkit-scrollbar-thumb]:bg-green-600
          [&::-webkit-scrollbar-thumb]:border
          [&::-webkit-scrollbar-thumb]:border-green-400
          hover:[&::-webkit-scrollbar-thumb]:bg-green-500"
        >
          {playlist.map((track, index) => (
            <div
              key={index}
              onClick={() => setCurrentTrack(index)}
              className={`p-2 cursor-pointer hover:bg-green-900/30 ${
                currentTrack === index ? "bg-green-900/50 border border-green-800" : ""
              }`}
            >
              <div className="text-sm text-green-400 font-mono">{track.title}</div>
              <div className="text-xs text-green-600 font-mono">{track.artist}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}