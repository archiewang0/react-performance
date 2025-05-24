import React, { useState, useRef, useEffect } from "react";

type LazyImageProps = {
  src: string;
  alt: string;
} & React.ImgHTMLAttributes<HTMLImageElement>;

// ========================
// 5. 延遲載入 (Lazy Loading)
// ========================
export const LazyImage = ({ src, alt, ...props }: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={imgRef}
      className="w-32 h-32 bg-gray-200 border border-gray-300 rounded flex items-center justify-center"
      {...props}
    >
      {isInView ? (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover rounded transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setIsLoaded(true)}
        />
      ) : (
        <span className="text-gray-500 text-sm">載入中...</span>
      )}
    </div>
  );
};
