import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Draggable from "react-draggable";
import { DragHandleDots2Icon, CrossCircledIcon } from '@radix-ui/react-icons'
import { useState } from "react";

interface CoordinateListProps {
  georefMarkerPairs: GeorefMarkerPair[];
  isHidden: boolean;
  toggleHidden: () => void;
}
interface GeorefMarkerPair {
  latLong: number[];
  pixelCoords: number[];
}

const CoordinateList: React.FC<CoordinateListProps> = ({ georefMarkerPairs, isHidden, toggleHidden }) => {
  return (
      <Draggable handle=".handle" defaultClassName={`rounded-lg fixed max-w-2xl z-[999] top-20 right-2 ${isHidden ? 'hidden' : ''}`}>
        <div>
          <div className="bg-gray-800 dark:bg-gray-900 dark:text-white p-2 pl-4 flex justify-between">
            <div>
              Coordinates
            </div>
            <div className="flex">
              <div className="handle cursor-move">
                <DragHandleDots2Icon width={24} height={24}/>
              </div>
              <div className="ml-2 cursor-pointer" onClick={toggleHidden}>
                <CrossCircledIcon width={24} height={24}/>
              </div>
            </div>
          </div>
          <Table className="dark:bg-gray-700">
            <TableHeader>
              <TableRow>
                <TableHead>Longitude</TableHead>
                <TableHead>Latitude</TableHead>
                <TableHead>Map X</TableHead>
                <TableHead>Map Y</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {georefMarkerPairs.map((pair, index) => (
                <TableRow key={index}>
                  <TableCell>{pair.latLong[0]}</TableCell>
                  <TableCell>{pair.latLong[1]}</TableCell>
                  <TableCell>{pair.pixelCoords[0]}</TableCell>
                  <TableCell>{pair.pixelCoords[1]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Draggable> 
  );
};

export default CoordinateList;


