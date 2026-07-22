import React, { useState, useEffect, useRef } from "react";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
}

export function LazyImage({ src, alt, className, placeholderClassName, ...props }: LazyImageProps) {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!window.IntersectionObserver) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "200px", // Load 200px before it enters the viewport
        threshold: 0.01,
      }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div 
      ref={imageRef} 
      className={`relative w-full h-full bg-zinc-950 flex items-center justify-center overflow-hidden ${placeholderClassName || ""}`}
    >
      {/* Loading Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-zinc-900/80 flex items-center justify-center animate-pulse">
          {/* A beautiful rotating spinner as a modern touch */}
          <div className="w-5 h-5 border-2 border-zinc-800 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Actual Image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 ease-out ${
            isLoaded 
              ? "opacity-80 group-hover:opacity-100 blur-0 scale-100" 
              : "opacity-0 blur-md scale-95"
          } ${className || ""}`}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
}
