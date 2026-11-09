"use client";

import { AlertCircleIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

const SAVE_EVERY_SECONDS = 5;

type Props = {
  src: string;
  title: string;
  // Where to start, so the learner picks up where they stopped
  startAt: number;
  // false for admins, who preview lessons without having progress
  canSave: boolean;
  onSave: (positionSeconds: number) => void;
  // The video played to the end
  onEnded: (durationSeconds: number) => void;
};

// A plain HTML video with the browser's own controls. It saves the position every few seconds,
// when paused, and when the learner leaves the page. Put a `key` on it so a new lesson starts fresh.
const VideoPlayer = ({ src, title, startAt, canSave, onSave, onEnded }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSaved = useRef(0);
  const [failed, setFailed] = useState(false);

  // The callbacks change on every render, so the cleanup below reads the latest one from here
  const saveRef = useRef(onSave);
  useEffect(() => {
    saveRef.current = onSave;
  });

  // Save once more if the learner leaves the page while the video is playing
  useEffect(() => {
    const video = videoRef.current;
    return () => {
      if (video && canSave && !video.ended && video.currentTime > 0 && video.currentTime !== lastSaved.current) {
        saveRef.current(video.currentTime);
      }
    };
  }, [canSave]);

  function handleLoadedMetadata() {
    const video = videoRef.current;
    // Resume, unless the learner had nearly reached the end (then start from the top)
    if (video && startAt > 0 && startAt < video.duration - 3) video.currentTime = startAt;
  }

  function save() {
    const video = videoRef.current;
    if (!video || !canSave) return;
    lastSaved.current = video.currentTime;
    onSave(video.currentTime);
  }

  function handleTimeUpdate() {
    const video = videoRef.current;
    if (video && Math.abs(video.currentTime - lastSaved.current) >= SAVE_EVERY_SECONDS) save();
  }

  function handlePause() {
    // Reaching the end also fires "pause", but that is handled by onEnded
    if (!videoRef.current?.ended) save();
  }

  function handleEnded() {
    const video = videoRef.current;
    if (video && canSave) onEnded(video.duration);
  }

  function retry() {
    setFailed(false);
    videoRef.current?.load();
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl bg-black shadow-md">
      <video
        ref={videoRef}
        src={src}
        title={title}
        controls
        playsInline
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPause={handlePause}
        onEnded={handleEnded}
        onError={() => setFailed(true)}
        onLoadedData={() => setFailed(false)}
        className="h-full w-full"
      />

      {failed && (
        <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/85 p-6 text-center text-white">
          <AlertCircleIcon className="size-8 text-amber-300" />
          <p className="text-sm font-medium">This video could not be played.</p>
          <Button variant="secondary" size="sm" onClick={retry}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
export default VideoPlayer;