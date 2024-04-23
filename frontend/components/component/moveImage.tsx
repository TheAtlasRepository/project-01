import React, { useState, useEffect } from "react";
import Image from "next/image";

interface ImageMapProps {
  src: string;
  children?: React.ReactNode;
  addMarker?: (event: React.MouseEvent<HTMLDivElement>) => void; // function to add marker

  // variables for dragging and zooming
  transform: { x: number; y: number };
  setTransform: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  zoomLevel: number;
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
  imageSize: { width: number; height: number };
  setImageSize: React.Dispatch<
    React.SetStateAction<{ width: number; height: number }>
  >;
}

export default function ImageMap({
  src,
  children,
  addMarker,
  imageSize,
  setImageSize,
  setTransform,
  setZoomLevel,
  transform,
  zoomLevel,
}: ImageMapProps) {
  //local state for dragging
  const [isDragging, setDragState] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 }); // starting point of drag

  const [delta, setDelta] = useState(1); // threshold of pixels moved for click
  const [start, setStart] = useState({ x: 0, y: 0 }); // starting point of click

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      const deltaX = event.clientX - dragStart.x; // speed of drag
      const deltaY = event.clientY - dragStart.y; // speed of drag
      setTransform((prevTransform) => ({
        x: prevTransform.x + deltaX,
        y: prevTransform.y + deltaY,
      }));
      setDragStart({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLDivElement>) => {
    setDragState(false);
    // check if it is a click
    // calculate the difference between start and end
    const diffX = Math.abs(event.clientX - start.x);
    const diffY = Math.abs(event.clientY - start.y);

    // if diffX and diffY are less than delta (which is 1), then it is a click
    if (diffX < delta && diffY < delta) {
      if (addMarker) {
        addMarker(event);
      }
    }
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    setDragState(true);
    setDragStart({ x: event.clientX, y: event.clientY });
    setStart({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setDragState(false);
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
      onMouseLeave={handleMouseLeave}
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
