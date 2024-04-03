import { use, useEffect, useRef, useState } from "react";
import { Map, NavigationControl, GeolocateControl, Marker } from "react-map-gl";
import type { MapRef } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "react-image-crop/dist/ReactCrop.css";
import ImageMap from "./moveImage";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import GeocoderControl from "./geocoder-control";
import MapStyleToggle from "./mapStyleToggle";
import Image from "next/image";
import mapboxgl from "mapbox-gl";
import * as api from "./projectAPI";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import CoordinateList from "./coordinateList";
import { Toaster, toast } from 'sonner'

interface SplitViewProps {
  isCoordList?: boolean;
  projectId: number;
}

export default function SplitView({ isCoordList, projectId }: SplitViewProps) {
  //project states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [helpMessage, setHelpMessage] = useState<string | null>(
    "Welcome to the georeferencing tool! Place a marker on the map or image to get started and dismiss this message. (The marker pair created should reflect the same point on the map and image.)"
  );

  //mapbox states
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";
  const mapRef = useRef<MapRef>(null);
  const [mapStyle, setMapStyle] = useState(
    "mapbox://styles/mapbox/streets-v12"
  );
  const handleStyleChange = (newStyle: string) => {
    setMapStyle(newStyle);
  };

  //georeferencing types
  type GeoCoordinates = [number, number];
  type imageCoordinates = [number, number];
  type ImageMarker = {
    pixelCoordinates: imageCoordinates;
  };

  // Array containing pairs of georeferenced markers and their corresponding image markers
  const [georefMarkerPairs, setGeorefMarkerPairs] = useState<
    { latLong: GeoCoordinates; pixelCoords: imageCoordinates }[]
  >([]);

  //map states
  const [mapMarkers, setMapMarkers] = useState<
    { geoCoordinates: GeoCoordinates }[]
  >([]);

  const [waitingForImageMarker, setWaitingForImageMarker] = useState(false);
  const [waitingForMapMarker, setWaitingForMapMarker] = useState(false);

  const addMapMarker = (geoCoordinates: GeoCoordinates) => {
    if (waitingForImageMarker) return;

    //add the marker to the mapMarkers state, used to render the markers on the map
    setMapMarkers([...mapMarkers, { geoCoordinates }]);

    //update the georefMarkerPairs state which is used to make the API call
    setGeorefMarkerPairs((pairs) => {
      const lastPair = pairs[pairs.length - 1];
      //if the array is empty or the last pair is complete, add a new pair
      if (
        pairs.length === 0 ||
        (lastPair.latLong[0] !== 0 &&
          lastPair.latLong[1] !== 0 &&
          lastPair.pixelCoords[0] !== 0 &&
          lastPair.pixelCoords[1] !== 0)
      ) {
        // Add a new pair if the array is empty or the last pair is complete
        return [...pairs, { latLong: geoCoordinates, pixelCoords: [0, 0] }];
      } else {
        // Update the last pair if it's incomplete
        return pairs.map((pair, index) =>
          index === pairs.length - 1
            ? { ...pair, latLong: geoCoordinates }
            : pair
        );
      }
    });
    // // reset drag start for the image, makes for better accuracy of drag distance when placing the next marker
    // setDragStart({ x: 0, y: 0 });
    // tells the component to wait for the next marker to be placed
    setWaitingForImageMarker(true);
    setWaitingForMapMarker(false);
  };

  //image states
  const [transform, setTransform] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageMarkers, setImageMarkers] = useState<ImageMarker[]>([]);
  const [calculatedDragDistance, setCalculatedDragDistance] = useState(0);

  const addImageMarker = (event: React.MouseEvent<HTMLDivElement>) => {
    console.log(waitingForMapMarker);
    if (waitingForMapMarker) return;

    //get the x and y coordinates of the click event
    const rect = (event.target as Element).getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    //adjust the x and y coordinates based on the transform and zoom level
    x = Math.round(x / zoomLevel);
    y = Math.round(y / zoomLevel);

    //calculate the start position of the drag
    setCalculatedDragDistance(
      Math.sqrt(Math.pow(dragStart.x - x, 2) + Math.pow(dragStart.y - y, 2))
    );

    //calculate the distance between the start and end of the drag
    const distance = Math.sqrt(
      Math.pow(dragStart.x - x, 2) + Math.pow(dragStart.y - y, 2)
    );

    //difference between dragdistance and distance, shows amount of pixels dragged
    const dragDifference = Math.abs(distance - calculatedDragDistance);
    //if distance is greater than 0.1 pixels, consider it a drag
    if (dragDifference > 0.1) {
      console.log("dragging");
      console.log("distance dragged:", dragDifference);
      //reset the drag start
      setDragStart({ x, y });
      return;
    }

    //add the marker to the imageMarkers state
    setImageMarkers([...imageMarkers, { pixelCoordinates: [x, y] }]);

    //update the georefMarkerPairs state which is used to make the API call
    setGeorefMarkerPairs((pairs) => {
      const lastPair = pairs[pairs.length - 1];
      if (
        pairs.length === 0 ||
        (lastPair.pixelCoords[0] !== 0 &&
          lastPair.pixelCoords[1] !== 0 &&
          lastPair.latLong[0] !== 0 &&
          lastPair.latLong[1] !== 0)
      ) {
        // Add a new pair if the array is empty or the last pair is complete
        return [...pairs, { latLong: [0, 0], pixelCoords: [x, y] }];
      } else {
        // Update the last pair if it's incomplete
        return pairs.map((pair, index) =>
          index === pairs.length - 1 ? { ...pair, pixelCoords: [x, y] } : pair
        );
      }
    });

    setWaitingForMapMarker(true);
    setWaitingForImageMarker(false);
  };

  //adjust marker positions based on image manipulation
  const adjustMarkerPositions = (
    pixelCoordinates: [number, number],
    transform: { x: number; y: number },
    zoomLevel: number,
    imageSize: { width: number; height: number }
  ): { left: string; top: string } => {
    //defines the center of the image
    const centerX = imageSize.width / 2;
    const centerY = imageSize.height / 2;

    //adjusts the marker position based on the transform and zoom level
    const adjustedX =
      centerX + (pixelCoordinates[0] - centerX) * zoomLevel + transform.x;
    const adjustedY =
      centerY + (pixelCoordinates[1] - centerY) * zoomLevel + transform.y;

    return {
      left: `${adjustedX}px`,
      top: `${adjustedY}px`,
    };
  };

  //ref to block multiple API calls for the same set of marker pairs
  const apiCallMade = useRef(false);

  //useEffect to make API call when the last pair of marker pairs is complete
  useEffect(() => {
    // Determine if the last pair is valid
    const lastPair = georefMarkerPairs[georefMarkerPairs.length - 1];
    if (lastPair) {
      // Remove help message
      setHelpMessage(null);
    }
    const isValidPair =
      lastPair &&
      lastPair.latLong[0] !== 0 &&
      lastPair.latLong[1] !== 0 &&
      lastPair.pixelCoords[0] !== 0 &&
      lastPair.pixelCoords[1] !== 0;

    // Only proceed if the last pair is valid and an API call has not been made for the current set
    if (isValidPair && !apiCallMade.current) {
      apiCallMade.current = true; // Block further API calls for the current set of marker pairs

      // Proceed to make API call with the last (and valid) pair
      const { latLong, pixelCoords } = lastPair;
      api
        .addMarkerPair(projectId, ...latLong, ...pixelCoords)
        .then((data) => {
          // Handle successful API response
          console.log("Success:", data);
          toast.success('Pair added successfully! Place another marker to add another pair.');
        })
        .catch((error) => {
          // Handle API call error
          console.error("Error:", error.message);
          toast.error('Error adding pair. Please try again.');
        })
        .finally(() => {
          // This reset allows for a new API call if further valid pairs are added
          apiCallMade.current = false;
          setWaitingForImageMarker(false);
          setWaitingForMapMarker(false);
        });
    }
  }, [georefMarkerPairs, projectId]); // Depend on georefMarkerPairs to automatically re-trigger when they change

  //function to handle the georeferencing process
  const handleGeoref = () => {
    console.log(projectId);
    api
      .initalGeorefimage(projectId)
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error.message);
      });
  };

  return (
    <div className="h-screen">
      <div className=""></div>
      <div className="flex justify-center">
        <div className="fixed w-2/5 z-50 m-4 text-center">
          <Toaster 
            expand={false}
            position="bottom-right"
            richColors
            closeButton
          />

          <Button className="m-4" variant={"blue"} onClick={handleGeoref}>
            Start Georeferencing
          </Button>

          {helpMessage && (
            <Alert variant={"default"} className="rounded-md p-2">
              <AlertDescription>{helpMessage}</AlertDescription>
            </Alert>
          )}

          {errorMessage && (
            <Alert
              variant="destructive"
              className="m-2 bg-white bg-opacity-75 p-2"
            >
              <AlertDescription>{errorMessage}</AlertDescription>
              <Button
                className="absolute top-1 right-1 m-0 p-0 w-5 h-5"
                size={"icon"}
                variant={"destructive"}
                onClick={() => setErrorMessage(null)}
              >
                X
              </Button>
            </Alert>
          )}
        </div>
      </div>
      <Allotment onDragEnd={() => mapRef.current?.resize()}>
        <Allotment.Pane minSize={200} className="dark:bg-gray-900">
          <Map
            mapboxAccessToken={mapboxToken}
            mapStyle={mapStyle}
            maxZoom={20}
            minZoom={3}
            reuseMaps={true}
            ref={mapRef}
            onClick={(event) => {
              const { lat, lng } = event.lngLat;
              addMapMarker([lat, lng]);
            }}
          >
            <div className="absolute top-0 left-0 m-4">
              <MapStyleToggle onStyleChange={handleStyleChange} />
            </div>

            <GeolocateControl position="bottom-right" />
            <NavigationControl position="bottom-right" />
            <div className="absolute top-20">
              <GeocoderControl
                mapboxAccessToken={mapboxToken}
                position="bottom-left"
              />
            </div>
            {mapMarkers.map((marker, index) => (
              <Marker
                key={index}
                longitude={marker.geoCoordinates[1]}
                latitude={marker.geoCoordinates[0]}
                offset={new mapboxgl.Point(0, -15)}
              >
                {/* use this for custom css on marker */}
                {/* <div className="marker">📍</div> */}
                <Image
                  src="/map-pin.svg"
                  alt="map-pin"
                  width={30}
                  height={30}
                />
              </Marker>
            ))}
          </Map>
        </Allotment.Pane>
        <Allotment.Pane minSize={200} className="bg-gray-100">
          <div className="w-full overflow-visible">
            <ImageMap
              src={localStorage.getItem("pdfData")!}
              onClick={addImageMarker}
              //transforms passed to imagemap component for image manipulation
              setTransform={setTransform}
              setZoomLevel={setZoomLevel}
              transform={transform}
              zoomLevel={zoomLevel}
              setIsDragging={setIsDragging}
              setDragStart={setDragStart}
              dragStart={dragStart}
              setImageSize={setImageSize}
              imageSize={imageSize}
            ></ImageMap>
            {imageMarkers.map((marker, index) => (
              <div
                key={index}
                style={{
                  position: "absolute",
                  // left: `${marker.pixelCoordinates[0]}px`,
                  // top: `${marker.pixelCoordinates[1]}px`,
                  transform: "translate(-50%, -85%)", // Center the marker
                  ...adjustMarkerPositions(
                    marker.pixelCoordinates,
                    transform,
                    zoomLevel,
                    imageSize
                  ),
                }}
              >
                <Image
                  src="/map-pin.svg"
                  alt="map-pin"
                  width={30}
                  height={30}
                  onDragStart={(e) => e.preventDefault()}
                />
              </div>
            ))}
          </div>
          {isCoordList && (
            <CoordinateList georefMarkerPairs={georefMarkerPairs} />
          )}
        </Allotment.Pane>
      </Allotment>
    </div>
  );
}
