import { useEffect, useRef, useState } from "react";
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
import { Button } from "@/components/ui/button";
import CoordinateList from "./coordinateList";
import SniperScope from "../ui/sniperScope";
import { Toaster, toast } from "sonner";
import MapToolbar from "@/components/ui/MapToolbar";
import ZoomButtons from "@/components/ui/ZoomButtons";
import {
  InfoCircledIcon,
  QuestionMarkCircledIcon,
  SewingPinFilledIcon,
} from "@radix-ui/react-icons";

interface SplitViewProps {
  projectId: number;

  georefMarkerPairs: {
    pointId: number | null;
    latLong: [number, number];
    pixelCoords: [number, number];
  }[];
  setGeorefMarkerPairs: React.Dispatch<
    React.SetStateAction<
      {
        pointId: number | null;
        latLong: [number, number];
        pixelCoords: [number, number];
      }[]
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

  setGeorefImageCoordinates: React.Dispatch<
    React.SetStateAction<[number, number, number, number]>
  >;

  onDeleteMarker: (pointId: number | null, index: number) => void;

  setHasBeenGeoreferenced: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function SplitView({
  projectId,
  georefMarkerPairs,
  setGeorefMarkerPairs,
  mapMarkers,
  setMapMarkers,
  imageMarkers,
  setImageMarkers,
  setGeorefImageCoordinates,
  onDeleteMarker,
  setHasBeenGeoreferenced,
}: SplitViewProps) {
  //Misc states
  const [helpMessage, setHelpMessage] = useState<string | null>(
    "<b>Welcome to the georeferencing tool!</b><br>To dismiss this message, click on it or place a marker on the map or image to get started. <br><i>The marker pair created should reflect the same point on the map and image.</i>"
  ); //Note: this is printed using dangerouslySetInnerHTML, so be careful with the content
  const [isFirstRef, setFirstRef] = useState(true);

  //mapbox states and style toggle
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

  // Marker states
  const [waitingForImageMarker, setWaitingForImageMarker] = useState(true);
  const [waitingForMapMarker, setWaitingForMapMarker] = useState(true);
  const [tempMapMarker, setTempMapMarker] = useState<GeoCoordinates | null>(
    null
  );
  const [tempImageMarker, setTempImageMarker] = useState<
    [number, number] | null
  >(null);

  // Function to add a marker on the map, on lat long coordinates
  const addMapMarker = (geoCoordinates: GeoCoordinates) => {
    if (!waitingForMapMarker) return;
    //add the marker to the mapMarkers state, used to render the markers on the map
    setTempMapMarker(geoCoordinates);
    setWaitingForMapMarker(false);
    setWaitingForImageMarker(false);
  };

  // Function to update the list of map markers and georefMarkerPairs
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
        return [
          ...pairs,
          { pointId: null, latLong: geoCoordinates, pixelCoords: [0, 0] },
        ];
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

  // Function to update the list of image markers and georefMarkerPairs
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
        return [
          ...pairs,
          { pointId: null, latLong: [0, 0], pixelCoords: pixelCoordinates },
        ];
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

  // Used to replace the pointId of the last pair in georefMarkerPairs
  const replaceLastMarkerId = (pointId: number) => {
    console.log("Replacing last marker id with:", pointId);
    setGeorefMarkerPairs((pairs) =>
      pairs.map((pair, index) =>
        index === pairs.length - 1 ? { ...pair, pointId } : pair
      )
    );
  };

  //image states
  const [transform, setTransform] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  //function to add a marker on the image based on where the user clicks
  const addImageMarker = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!waitingForImageMarker) return;
    //get the x and y coordinates of the click event
    const rect = (event.target as Element).getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    //adjust the x and y coordinates based on the transform and zoom level
    x = Math.round(x / zoomLevel / scaleFactor);
    y = Math.round(y / zoomLevel / scaleFactor);

    setTempImageMarker([x, y]);
    setWaitingForImageMarker(false);
    setWaitingForMapMarker(false);
  };

  const [scaleFactor, setScaleFactor] = useState(1); // initial scale factor of image used to fit image to screen
  //adjust marker positions based on image manipulation
  const adjustMarkerPositions = (
    pixelCoordinates: [number, number],
    transform: { x: number; y: number },
    zoomLevel: number,
    imageSize: { width: number; height: number },
    scaleFactor: number
  ): { left: string; top: string } => {
    //defines the center of the image
    const centerX = imageSize.width / 2;
    const centerY = imageSize.height / 2;

    //adjusts the marker position based on the transform and zoom level
    const adjustedX =
      centerX +
      (pixelCoordinates[0] - centerX) * zoomLevel * scaleFactor +
      transform.x;
    const adjustedY =
      centerY +
      (pixelCoordinates[1] - centerY) * zoomLevel * scaleFactor +
      transform.y;

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
    // Check if the last pair is valid
    // A valid pair has non-zero values for all 4 coordinates
    const isValidPair =
      lastPair &&
      lastPair.pointId === null &&
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
          replaceLastMarkerId(data.Point.inProjectId);

          if (!hasEnoughEntries) {
            setHelpMessage(`Pair added! ${3 - georefMarkerPairs.length} more pairs needed to georeference the map.`);
          }
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
            // On first georef, set help message to indicate georeferencing is in progress
            if (isFirstRef === true) {
              setHelpMessage("Enough pairs added! Georeferencing...");
            }

            handleGeoref();
          }
        });
    }
  }, [mapMarkers, imageMarkers, projectId]); // Depend on georefMarkerPairs to automatically re-trigger when they change

  //function to handle the georeferencing process
  const handleGeoref = () => {
    console.log(projectId);
    api
      .initalGeorefimage(projectId)
      .then((data) => {
        console.log("Success image georeferenced:", data);
        api.getGeorefCoordinates(projectId).then((data) => {
          //flatten 2d array to 1d array
          const flatData = data.flat();
          setGeorefImageCoordinates(
            flatData as [number, number, number, number]
          );
          console.log("Georef Corner Coordinates:", data);
          setHasBeenGeoreferenced(true);

          if (isFirstRef === true) {
            // On first completed georef, set help message to indicate completion
            setHelpMessage(
              "Enough pairs added! The map has been georeferenced, go to Overlay to see your map!"
            );
            setFirstRef(false);
          } else {
            // If it's not the initial georef, set help message to indicate update
            setHelpMessage(
              "Georeferenced map has been updated with the extra points."
            );
          }
        });
      })
      .catch((error) => {
        console.error("Error:", error.message);
      });
  };

  // Function to confirm image or map marker placement
  const confirmPlacement = () => {
    if (tempMapMarker) {
      setMapMarkers([...mapMarkers, { geoCoordinates: tempMapMarker }]);

      updateMapMarkerList(tempMapMarker);
      setTempMapMarker(null);
      setWaitingForImageMarker(true);
      setWaitingForMapMarker(false);
    }
    if (tempImageMarker) {
      updateImageMarkerList(tempImageMarker);
      setTempImageMarker(null);
      setWaitingForMapMarker(true);
      setWaitingForImageMarker(false);
    }
  };

  // Function to cancel image or map marker placement
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
    let x = position.x / zoomLevel / scaleFactor + tempImageMarker[0];
    let y = position.y / zoomLevel / scaleFactor + tempImageMarker[1];

    // round to nearest whole pixel
    x = Math.round(x);
    y = Math.round(y);

    // reset transform position to zero
    setControlledPosition({ x: 0, y: 0 });
    // set the new position of the marker
    setTempImageMarker([x, y]);
  };

  // useEffect to check if the tempImageMarker is outside the bounds of the image
  useEffect(() => {
    // if sniperscope position is outside bounds of image, reset to closest edge
    if (tempImageMarker) {
      const x = tempImageMarker[0];
      const y = tempImageMarker[1];
      if (x < 0) {
        setTempImageMarker([0, y]);
      }
      if (y < 0) {
        setTempImageMarker([x, 0]);
      }
      if (x > imageSize.width) {
        setTempImageMarker([imageSize.width, y]);
      }
      if (y > imageSize.height) {
        setTempImageMarker([x, imageSize.height]);
      }
    }
  }, [tempImageMarker, imageSize]);

  // function to handle mouse wheel event for zooming in and out
  const handleMouseWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const zoomDelta = event.deltaY > 0 ? -0.1 : 0.1;
    const newZoomLevel = Math.max(zoomLevel + zoomDelta, 0.1);
    setZoomLevel(newZoomLevel);
  };

  return (
    <div className="h-screen">
      <MapToolbar>
        <MapStyleToggle onStyleChange={handleStyleChange} />
        <div>
          <Button
            className={`${
              !isCoordTableHidden
                ? "bg-blue-500 dark:bg-blue-500"
                : "bg-gray-700 dark:bg-gray-700"
            } hover:bg-blue-800 dark:hover:bg-blue-800 dark:text-white`}
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
              <InfoCircledIcon
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
          <div className="w-full overflow-visible" onWheel={handleMouseWheel}>
            <ImageMap
              src={localStorage.getItem("pdfData")!}
              addMarker={addImageMarker}
              //transforms passed to imagemap component for image manipulation
              setTransform={setTransform}
              setZoomLevel={setZoomLevel}
              transform={transform}
              zoomLevel={zoomLevel}
              setImageSize={setImageSize}
              imageSize={imageSize}
              scaleFactor={scaleFactor}
              setScaleFactor={setScaleFactor}
            ></ImageMap>
            <ZoomButtons setZoomLevel={setZoomLevel}></ZoomButtons>
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
                    imageSize,
                    scaleFactor
                  ),
                }}
                className="pointer-events-auto"
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
                    imageSize,
                    scaleFactor
                  ),
                }}
                className="pointer-events-auto"
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
        onDeleteMarker={onDeleteMarker}
      />
    </div>
  );
}
