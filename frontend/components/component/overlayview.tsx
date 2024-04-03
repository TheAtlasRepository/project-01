import React, { useState, useEffect } from "react";
import { Map, Source, Layer } from "react-map-gl";
import { Slider } from "@/components/ui/slider"
import MapStyleToggle from "./mapStyleToggle";
import { GeolocateControl, NavigationControl } from "react-map-gl";
import GeocoderControl from "./geocoder-control";

interface MapOverlayProps {
  projectId: number;
}

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

const OverlayView = ({ projectId }: MapOverlayProps) => {

  const [dataUrl, setDataUrl] = useState("");
  const [imageSrc, setImageSrc] = useState(localStorage.getItem("pdfData")!);
  const [opacity, setOpacity] = useState(100);
  const [mapStyle, setMapStyle] = useState(
    "mapbox://styles/mapbox/streets-v12"
    );

  // Used to set the opacity of the image overlay
  const handleOpacity = (values: number[]) => {
    // values is an array of the current value of the slider
    const opacityValue = values[0]
    setOpacity(opacityValue);
  };
  // Function to change the style of the map
  const handleStyleChange = (style: string) => {
    setMapStyle(style);
  };

  // Base URL for the backend API from .env
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Converts the georeferenced image to a data URL
  useEffect(() => {
    // Fetch the image as a blob url
    fetch(imageSrc)
      .then((response) => response.blob())
      .then((blob) => {
        // Convert the blob URL to a data URL
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result;
          setDataUrl(dataUrl as string);
        };
        reader.readAsDataURL(blob);
      })
      // Log any errors
      .catch((error) =>
        console.error("Error converting blob URL to data URL:", error)
      );
  }, [projectId, imageSrc]);

  return (
    <div className="w-full h-full">
      <Map
        style={{ width: "100%", height: "100%" }}
        mapStyle={mapStyle}
        mapboxAccessToken={mapboxToken}
        minZoom={5}
        maxZoom={19}
      >
        <div className="absolute top-0 left-0 m-4">
          <MapStyleToggle onStyleChange={handleStyleChange} />
        </div>

        <div className="flex justify-center mt-5">
          <div className="fixed z-50 w-1/5">
            <Slider
              defaultValue={[100]}
              min={0}
              max={100}
              step={1}
              onValueChange={handleOpacity}/>
          </div>
        </div>
        <GeolocateControl position="bottom-right" />
        <NavigationControl position="bottom-right" />
        <div className="absolute top-20">
              <GeocoderControl
              mapboxAccessToken={mapboxToken}
              position="bottom-left"
              />
            </div>
        {dataUrl && (
          <Source
            id="georeferenced-image-source"
            type="raster"
            tiles={[`${BASE_URL}/project/${projectId}/tiles/{z}/{x}/{y}.png`]}
            tileSize={256}
          >
            <Layer
              id="georeferenced-image-layer"
              source="georeferenced-image-source"
              type="raster"
              paint={{ "raster-opacity": opacity / 100 }}
            />
          </Source>
        )}
      </Map>
    </div>
  );
};

export default OverlayView;
