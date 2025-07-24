import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Pause, Volume2, Volume1, VolumeX, Rewind, FastForward } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatTime } from "@/lib/utils";

interface SermonPlayerProps {
  sermon: {
    id: string;
    title: string;
    preacher: string;
    date: string;
    scripture_reference?: string;
    category?: string;
    audio_url: string;
  };
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SermonPlayer({ sermon, isOpen, onOpenChange }: SermonPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Reset player state when sermon changes
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
    }
  }, [sermon.id]);

  useEffect(() => {
    // Set up audio event listeners
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    const newTime = value[0];
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;
    const newVolume = value[0];
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMuteState = !isMuted;
    audioRef.current.muted = newMuteState;
    setIsMuted(newMuteState);
  };

  const skip = (seconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.min(Math.max(currentTime + seconds, 0), duration);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{sermon.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col space-y-1.5">
            <p className="text-sm font-medium">{sermon.preacher}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(sermon.date).toLocaleDateString()}
            </p>
            {sermon.scripture_reference && (
              <p className="text-sm">Scripture: {sermon.scripture_reference}</p>
            )}
            {sermon.category && (
              <Badge variant="outline" className="w-fit">
                {sermon.category}
              </Badge>
            )}
          </div>

          <audio
            ref={audioRef}
            src={sermon.audio_url}
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="hidden"
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">{formatTime(currentTime)}</span>
              <span className="text-sm">{formatTime(duration)}</span>
            </div>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => skip(-10)}
                title="Rewind 10 seconds"
              >
                <Rewind className="h-5 w-5" />
              </Button>
              <Button
                variant="default"
                size="icon"
                onClick={togglePlayPause}
                className="h-10 w-10 rounded-full"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => skip(10)}
                title="Forward 10 seconds"
              >
                <FastForward className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : volume > 0.5 ? (
                  <Volume2 className="h-5 w-5" />
                ) : (
                  <Volume1 className="h-5 w-5" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="w-24 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}