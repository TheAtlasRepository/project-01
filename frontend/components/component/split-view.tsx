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
import SniperScope from "../ui/sniperScope";
import { Toaster, toast } from "sonner";
import MapToolbar from "@/components/ui/MapToolbar";
import {
  QuestionMarkCircledIcon,
  SewingPinFilledIcon,
} from "@radix-ui/react-icons";

interface SplitViewProps {
  projectId: number;
  georefMarkerPairs: {
    latLong: [number, number];
    pixelCoords: [number, number];
  }[];
  setGeorefMarkerPairs: React.Dispatch<
    React.SetStateAction<
      { latLong: [number, number]; pixelCoords: [number, number] }[]
    >
  >;
  mapMarkers: { geoCoordinates: [number, number] }[];
  setMapMarkers: React.Dispatch<
    React.SetStateAction<{ geoCoordinates: [number, number] }[]>
  >;

  imageMarkers: { pixelCoordinates: [number, number] }[];
  setImageMarkers: React.Dispatch<
    React.SetStateAction<{ pixelCoordinates: [number, number] }[]>
  >;
}

export default function SplitView({
  projectId,
  georefMarkerPairs,
  setGeorefMarkerPairs,
  mapMarkers,
  setMapMarkers,
  imageMarkers,
  setImageMarkers,
}: SplitViewProps) {
  //project states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [helpMessage, setHelpMessage] = useState<string | null>(
    "<b>Welcome to the georeferencing tool!</b><br>To dismiss this message, click on it or place a marker on the map or image to get started. <br><i>The marker pair created should reflect the same point on the map and image.</i>"
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

  //state and toggle for coordinate list
  const [isCoordTableHidden, setIsCoordTableHidden] = useState(true);

  const toggleCoordTableHidden = () => {
    setIsCoordTableHidden(!isCoordTableHidden);
  };

  //georeferencing types
  type GeoCoordinates = [number, number];

  const [waitingForImageMarker, setWaitingForImageMarker] = useState(true);
  const [waitingForMapMarker, setWaitingForMapMarker] = useState(true);

  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [tempMapMarker, setTempMapMarker] = useState<GeoCoordinates | null>(
    null
  );
  const [tempImageMarker, setTempImageMarker] = useState<
    [number, number] | null
  >(null);

  const addMapMarker = (geoCoordinates: GeoCoordinates) => {
    if (!waitingForMapMarker) return;
    //add the marker to the mapMarkers state, used to render the markers on the map
    setTempMapMarker(geoCoordinates);
    // // reset drag start for the image, makes for better accuracy of drag distance when placing the next marker
    // setDragStart({ x: 0, y: 0 });
    setWaitingForMapMarker(false);
    setWaitingForImageMarker(false);
  };

  const updateMapMarkerList = (geoCoordinates: GeoCoordinates) => {
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
  };

  const updateImageMarkerList = (pixelCoordinates: [number, number]) => {
    //add the marker to the imageMarkers state
    setImageMarkers((imageMarkers) => [...imageMarkers, { pixelCoordinates }]);

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
        return [...pairs, { latLong: [0, 0], pixelCoords: pixelCoordinates }];
      } else {
        // Update the last pair if it's incomplete
        return pairs.map((pair, index) =>
          index === pairs.length - 1
            ? { ...pair, pixelCoords: pixelCoordinates }
            : pair
        );
      }
    });
  };

  //image states
  const [transform, setTransform] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  // const [imageMarkers, setImageMarkers] = useState<ImageMarker[]>([]);
  const [calculatedDragDistance, setCalculatedDragDistance] = useState(0);
  const [isCoordList, setIsCoordList] = useState(false);

  const addImageMarker = (event: React.MouseEvent<HTMLDivElement>) => {
    console.log(waitingForMapMarker);
    if (!waitingForImageMarker) return;

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
    setTempImageMarker([x, y]);
    setWaitingForImageMarker(false);
    setWaitingForMapMarker(false);
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

    const hasEnoughEntries =
      // Check if there are at least 3 pairs and all pairs are valid
      georefMarkerPairs.length >= 3 &&
      georefMarkerPairs.every(
        (pair) =>
          pair.latLong.every((val) => val !== 0) &&
          pair.pixelCoords.every((val) => val !== 0)
      );
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
          toast.success(
            "Pair added successfully! Place another marker to add another pair."
          );
        })
        .catch((error) => {
          // Handle API call error
          console.error("Error:", error.message);
          toast.error("Error adding pair. Please try again.");
        })
        .finally(() => {
          // This reset allows for a new API call if further valid pairs are added
          apiCallMade.current = false;
          setWaitingForImageMarker(true);
          setWaitingForMapMarker(true);

          if (hasEnoughEntries) {
            setHelpMessage(
              "All pairs added! The map has been georeferenced, go to overlayview to see your georeferenced map"
            );
            handleGeoref();
          }
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

  const confirmPlacement = () => {
    if (tempMapMarker) {
      setMapMarkers([...mapMarkers, { geoCoordinates: tempMapMarker }]);

      updateMapMarkerList(tempMapMarker);
      setTempMapMarker(null);
      setWaitingForImageMarker(true);
      setWaitingForMapMarker(false);
    }
    if (tempImageMarker) {
      setImageMarkers([...imageMarkers, { pixelCoordinates: tempImageMarker }]);

      updateImageMarkerList(tempImageMarker);
      setTempImageMarker(null);
      setWaitingForMapMarker(true);
      setWaitingForImageMarker(false);
    }
  };

  const cancelPlacement = () => {
    if (tempMapMarker) {
      setTempMapMarker(null);
      // setWaitingForMapMarker(true) a short delay after canceling to prevent accidental placement
      setTimeout(() => {
        setWaitingForMapMarker(true);
      }, 100);
    }
    if (tempImageMarker) {
      setTempImageMarker(null);
      setWaitingForImageMarker(true);
    }
  };

  //controlled position for sniper scope
  //used to reset the dragging transformations to zero when the drag ends
  const [controlledPosition, setControlledPosition] = useState({ x: 0, y: 0 });

  // handle drag end for sniper scope on imageMap
  const handleSniperDragEnd = (position: { x: number; y: number }) => {
    if (!tempImageMarker) return;
    // add the dragged distance to the original tempImageMarker position
    // to get the new position of the marker
    let x = position.x + tempImageMarker[0];
    let y = position.y + tempImageMarker[1];

    // round to nearest whole pixel
    Math.round(x);
    Math.round(y);

    // reset transform position to zero
    setControlledPosition({ x: 0, y: 0 });
    // set the new position of the marker
    setTempImageMarker([x, y]);
  };

  return (
    <div className="h-screen">
      <MapToolbar>
        <MapStyleToggle onStyleChange={handleStyleChange} />

        <div>
          <Button
            className={`${!isCoordTableHidden ? "bg-blue-500 dark:bg-blue-500" : "bg-gray-700 dark:bg-gray-700"} hover:bg-blue-800 dark:hover:bg-blue-800 dark:text-white`}
            onClick={toggleCoordTableHidden}
          >
            <SewingPinFilledIcon /> Coordinates
          </Button>
        </div>

        {helpMessage && (
          <div
            className="max-w-sm flex flex-row cursor-pointer"
            onClick={() => setHelpMessage(null)}
          >
            <div className="text-2xl mr-3">
              <QuestionMarkCircledIcon
                height={48}
                width={48}
                color=""
                className="fill-gray-800 dark:fill-white"
              />
            </div>
            <div dangerouslySetInnerHTML={{ __html: helpMessage }} />
          </div>
        )}
      </MapToolbar>

      <div className=""></div>
      <div className="flex justify-center">
        <div className="fixed w-2/5 z-50 m-4 text-center">
          <Toaster
            expand={false}
            position="bottom-right"
            richColors
            closeButton
          />

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
            {tempMapMarker && (
              <Marker
                longitude={tempMapMarker[1]}
                latitude={tempMapMarker[0]}
                draggable={true}
                onDragEnd={(event) => {
                  const { lat, lng } = event.lngLat;
                  setTempMapMarker([lat, lng]);
                }}
              >
                <SniperScope
                  onConfirm={confirmPlacement}
                  onCancel={cancelPlacement}
                />
              </Marker>
            )}
          </Map>
        </Allotment.Pane>
        <Allotment.Pane minSize={200} className="bg-gray-100 dark:bg-gray-800">
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
            {tempImageMarker && (
              <div
                style={{
                  position: "absolute",
                  transform: "translate(-50%, -50%)", // Center the marker
                  ...adjustMarkerPositions(
                    tempImageMarker,
                    transform,
                    zoomLevel,
                    imageSize
                  ),
                }}
              >
                <SniperScope
                  position={controlledPosition}
                  onConfirm={confirmPlacement}
                  onCancel={cancelPlacement}
                  draggable={true}
                  onDragEnd={handleSniperDragEnd}
                />
              </div>
            )}
          </div>
        </Allotment.Pane>
      </Allotment>
      <CoordinateList
        georefMarkerPairs={georefMarkerPairs}
        isHidden={isCoordTableHidden}
        toggleHidden={toggleCoordTableHidden}
      />
    </div>
  );
}
