import React, { useState, useEffect } from "react";
import Image from "next/image";

interface ImageMapProps {
  src: string;
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;

  // variables for dragging and zooming
  zoomLevel: number;
  transform: { x: number; y: number };
  setTransform: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
  imageSize: { width: number; height: number };
  setImageSize: React.Dispatch<
    React.SetStateAction<{ width: number; height: number }>
  >;

  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
  setDragStart: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  dragStart: { x: number; y: number };
}

export default function ImageMap({
  src,
  children,
  onClick,
  setIsDragging,
  setDragStart,
  dragStart,
  imageSize,
  setImageSize,

  setTransform,
  setZoomLevel,
  transform,
  zoomLevel,
}: ImageMapProps) {
  //local state for dragging
  const [localIsDragging, setLocalIsDragging] = useState(false);
  // const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const setDragState = (bool: boolean) => {
    setIsDragging(bool);
    setLocalIsDragging(bool);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (localIsDragging) {
      const deltaX = event.clientX - dragStart.x; // speed of drag
      const deltaY = event.clientY - dragStart.y; // speed of drag
      setTransform((prevTransform) => ({
        x: prevTransform.x + deltaX,
        y: prevTransform.y + deltaY,
      }));
      setDragStart({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseUp = () => {
    setDragState(false);
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    setDragState(true);
    setDragStart({ x: event.clientX, y: event.clientY });
  };

  //event listener for mouse wheel
  useEffect(() => {
    const handleMouseWheel = (event: React.WheelEvent<HTMLDivElement>) => {
      event.preventDefault();
      const zoomDelta = event.deltaY > 0 ? -0.1 : 0.1;
      const minZoom = 0.1;
      setZoomLevel((prevZoomLevel) =>
        Math.max(prevZoomLevel + zoomDelta, minZoom)
      );
    };

    const container = document.getElementById("image-container");
    if (container) {
      container.addEventListener(
        "wheel",
        handleMouseWheel as unknown as EventListener
      );
    }
    return () => {
      if (container) {
        container.removeEventListener(
          "wheel",
          handleMouseWheel as unknown as EventListener
        );
      }
    };
  }, [setZoomLevel]);

  return (
    // <div style={{ width: imgSize.width / 2, height: imgSize.height / 2 }}>
    <div
      className="flex h-full"
      style={{
        position: "relative",
        width: imageSize.width,
        height: imageSize.height,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={onClick}
      id="image-container"
    >
      <div
        style={{
          position: "absolute",
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${zoomLevel})`,
          overflow: "auto",
        }}
      >
        <Image
          src={src}
          alt="imageMap"
          width={imageSize.width}
          height={imageSize.height}
          onLoadingComplete={({ naturalWidth, naturalHeight }) => {
            setImageSize({ width: naturalWidth, height: naturalHeight });
          }}
          //prevent default drag event
          onDragStart={(e) => {
            e.preventDefault();
          }}
        />
      </div>
      {children}
    </div>
  );
}
