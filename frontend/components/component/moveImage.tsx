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
  scaleFactor: number;
  setScaleFactor: React.Dispatch<React.SetStateAction<number>>;
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
  scaleFactor,
  setScaleFactor,
}: ImageMapProps) {
  //local state for dragging
  const [isDragging, setDragState] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 }); // starting point of drag

  const [delta, setDelta] = useState(1); // threshold of pixels moved for click
  const [start, setStart] = useState({ x: 0, y: 0 }); // starting point of click
  const [containerSize, setContainerSize] = useState({
    width: window.innerWidth / 2,
    height: window.innerHeight,
  }); // size of container of top level div of image
  const [scale, setScale] = useState(zoomLevel * scaleFactor); //scale which is zoomlevel * scaleFactor

  // Handler for moving image when dragging
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

  // Handler for ending drag
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

  // Handler for starting drag
  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    setDragState(true);
    setDragStart({ x: event.clientX, y: event.clientY }); // set start point of drag used for calculating speed of drag
    setStart({ x: event.clientX, y: event.clientY }); // set start point of click used for checking if it is a click
  };

  // Handler for if mouse leaves the image
  const handleMouseLeave = () => {
    setDragState(false);
  };

  //event listener for mouse wheel
  useEffect(() => {
    const handleMouseWheel = (event: React.WheelEvent<HTMLDivElement>) => {
      event.preventDefault();
      const zoomFactor = 0.1;
      const zoomDelta = event.deltaY > 0 ? -zoomFactor : zoomFactor;
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
  }, [setZoomLevel, scaleFactor]);

  //update scale when zoomLevel or scaleFactor changes
  useEffect(() => {
    setScale(zoomLevel * scaleFactor);
  }, [zoomLevel, scaleFactor]);

  // function to scale image to fit screen
  const scaleImage = (naturalWidth: number, naturalHeight: number) => {
    // get container size
    const containerWidth = containerSize.width;
    const containerHeight = containerSize.height;

    // calculate scale factor to fit image to screen
    const scaleFactorX = containerWidth / naturalWidth;
    const scaleFactorY = containerHeight / naturalHeight;
    let scaleFactor = Math.min(scaleFactorX, scaleFactorY); //uses the smaller scale factor to fit image to screen to ensure that the whole image is visible

    // //round to 1 decimal place
    scaleFactor = Math.round(scaleFactor * 10) / 10;
    //prevent scalefactor from being less than 0.1
    scaleFactor = Math.max(scaleFactor, 0.1);
    setScaleFactor(scaleFactor);

    // set initial scale
    setScale(zoomLevel * scaleFactor);
    console.log("scale", scale);

    let translateX = 0;
    let translateY = 0;
    // transform x to center image coordinates
    translateX = (containerWidth - naturalWidth * scale) / 2;
    translateY = (containerHeight - naturalHeight * scale) / 2;
    setTransform({ x: translateX, y: translateY });
  };

  return (
    // image container fit to screen
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
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${scale})`,
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

            // if image size is available, scale image to fit screen
            scaleImage(
              naturalWidth,
              naturalHeight
              // window.innerWidth,
              // window.innerHeight
            );
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
