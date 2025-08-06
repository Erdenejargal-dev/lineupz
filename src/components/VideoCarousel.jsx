'use client';

import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

const VideoCarousel = () => {
  const videoRef = useRef([]);
  const videoSpanRef = useRef([]);
  const videoDivRef = useRef([]);

  const [video, setVideo] = useState({
    isEnd: false,
    startPlay: false,
    videoId: 0,
    isLastVideo: false,
    isPlaying: false,
  });
  const [loadedData, setLoadedData] = useState([]);

  const { isEnd, isLastVideo, startPlay, videoId, isPlaying } = video;

  // Mock video data for Tabi
  const hightlightsSlides = [
    {
      id: 1,
      textLists: ["Smart Booking", "Real-time scheduling"],
      video: "/videos/tabi-booking.mp4", // You'll need to add actual videos
      videoDuration: 4,
    },
    {
      id: 2,
      textLists: ["Digital Queues", "No more waiting"],
      video: "/videos/tabi-queue.mp4",
      videoDuration: 5,
    },
    {
      id: 3,
      textLists: ["Google Calendar", "Perfect sync"],
      video: "/videos/tabi-calendar.mp4",
      videoDuration: 4,
    },
    {
      id: 4,
      textLists: ["Mobile First", "Beautiful experience"],
      video: "/videos/tabi-mobile.mp4",
      videoDuration: 6,
    },
  ];

  useEffect(() => {
    const initAnimations = async () => {
      if (typeof window !== 'undefined') {
        try {
          const { gsap } = await import('gsap');
          const { ScrollTrigger } = await import('gsap/ScrollTrigger');
          
          gsap.registerPlugin(ScrollTrigger);

          gsap.to("#slider", {
            transform: `translateX(${-100 * videoId}%)`,
            duration: 2,
            ease: "power2.inOut",
          });

          gsap.to("#video", {
            scrollTrigger: {
              trigger: "#video",
              toggleActions: "restart none none none",
            },
            onComplete: () => {
              setVideo((pre) => ({
                ...pre,
                startPlay: true,
                isPlaying: true,
              }));
            },
          });
        } catch (error) {
          console.log('GSAP not available');
        }
      }
    };

    initAnimations();
  }, [isEnd, videoId]);

  useEffect(() => {
    if (loadedData.length > 3) {
      if (!isPlaying) videoRef.current[videoId]?.pause();
      else startPlay && videoRef.current[videoId]?.play();
    }
  }, [startPlay, videoId, isPlaying, loadedData]);

  const handleLoadedMetadata = (i, e) => setLoadedData((pre) => [...pre, e]);

  useEffect(() => {
    let currentProgress = 0;
    const span = videoSpanRef.current;

    if (span[videoId]) {
      const initProgressAnimation = async () => {
        try {
          const { gsap } = await import('gsap');
          
          const anim = gsap.to(span[videoId], {
            onUpdate: () => {
              const progress = Math.ceil(anim.progress() * 100);

              if (progress !== currentProgress) {
                currentProgress = progress;

                gsap.to(videoDivRef.current[videoId], {
                  width:
                    window.innerWidth < 760
                      ? "10vw"
                      : window.innerWidth < 1200
                        ? "10vw"
                        : "4vw",
                });

                gsap.to(span[videoId], {
                  width: `${currentProgress}%`,
                  backgroundColor: "white",
                });
              }
            },
            onComplete: () => {
              if (isPlaying) {
                gsap.to(videoDivRef.current[videoId], {
                  width: "12px",
                });

                gsap.to(span[videoId], {
                  backgroundColor: "#afafaf",
                });
              }
            },
          });

          if (videoId === 0) anim.restart();

          const animUpdate = () => {
            if (videoRef.current[videoId]) {
              anim.progress(
                videoRef.current[videoId].currentTime /
                  hightlightsSlides[videoId].videoDuration,
              );
            }
          };

          if (isPlaying) gsap.ticker.add(animUpdate);
          else gsap.ticker.remove(animUpdate);
        } catch (error) {
          console.log('GSAP not available for progress animation');
        }
      };

      initProgressAnimation();
    }
  }, [videoId, startPlay, isPlaying, hightlightsSlides]);

  const handleProcess = (type, i) => {
    switch (type) {
      case "video-end":
        setVideo((pre) => ({ ...pre, isEnd: true, videoId: i + 1 }));
        break;

      case "video-last":
        setVideo((pre) => ({ ...pre, isLastVideo: true }));
        break;

      case "video-reset":
        setVideo((pre) => ({ ...pre, isLastVideo: false, videoId: 0 }));
        break;

      case "play":
      case "pause":
        setVideo((pre) => ({ ...pre, isPlaying: !pre.isPlaying }));
        break;

      default:
        return video;
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center overflow-hidden">
        {hightlightsSlides.map((list, i) => (
          <div key={list.id} id="slider" className="pr-10 sm:pr-20 min-w-full">
            <div className="relative">
              <div className="flex justify-center items-center w-full h-[70vh] overflow-hidden rounded-3xl bg-black">
                {/* Fallback gradient background since we don't have actual videos */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-80"></div>
                
                {/* Mock video element - replace with actual video when available */}
                <div
                  id="video"
                  className="w-full h-full flex items-center justify-center relative"
                  ref={(el) => (videoRef.current[i] = el)}
                >
                  <div className="text-center text-white z-10">
                    <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4 mx-auto backdrop-blur-sm">
                      <Play className="w-10 h-10 text-white ml-1" />
                    </div>
                    <p className="text-xl font-medium">Tabi Demo Video {i + 1}</p>
                  </div>
                </div>

                {/* Uncomment when you have actual videos */}
                {/* <video
                  id="video"
                  playsInline
                  preload="auto"
                  muted
                  ref={(el) => (videoRef.current[i] = el)}
                  onEnded={() =>
                    i !== 3
                      ? handleProcess("video-end", i)
                      : handleProcess("video-last")
                  }
                  onPlay={() =>
                    setVideo((prevVideo) => ({ ...prevVideo, isPlaying: true }))
                  }
                  onLoadedMetadata={(e) => handleLoadedMetadata(i, e)}
                  className={`${list.id === 2 && "translate-x-44"} pointer-events-none w-full h-full object-cover`}
                >
                  <source src={list.video} type="video/mp4" />
                </video> */}
              </div>

              <div className="absolute left-[5%] top-12 z-10">
                {list.textLists.map((text, index) => (
                  <p key={index} className="text-xl font-medium md:text-2xl text-white mb-2">
                    {text}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center items-center relative mt-10">
        <div className="flex justify-center items-center rounded-full bg-gray-300 px-7 py-5 backdrop-blur">
          {hightlightsSlides.map((_, i) => (
            <span
              key={i}
              ref={(el) => (videoDivRef.current[i] = el)}
              className="relative mx-2 w-3 h-3 cursor-pointer rounded-full bg-gray-200"
            >
              <span
                className="absolute w-full h-full rounded-full"
                ref={(el) => (videoSpanRef.current[i] = el)}
                title="video progress bar"
              />
            </span>
          ))}
        </div>

        <button
          className="ml-4 p-3 rounded-full bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 transition-all"
          onClick={
            isLastVideo
              ? () => handleProcess("video-reset")
              : !isPlaying
                ? () => handleProcess("play")
                : () => handleProcess("pause")
          }
        >
          {isLastVideo ? (
            <RotateCcw className="w-5 h-5 text-white" />
          ) : !isPlaying ? (
            <Play className="w-5 h-5 text-white ml-0.5" />
          ) : (
            <Pause className="w-5 h-5 text-white" />
          )}
        </button>
      </div>
    </div>
  );
};

export default VideoCarousel;
