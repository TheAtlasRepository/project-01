import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Draggable from "react-draggable";

interface CoordinateListProps {
  georefMarkerPairs: GeorefMarkerPair[];
}
interface GeorefMarkerPair {
  latLong: number[];
  pixelCoords: number[];
}

const CoordinateList: React.FC<CoordinateListProps> = ({
  georefMarkerPairs,
}) => {
  if (!georefMarkerPairs.length) return null;

  return (
    <Draggable>
      <Table>
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
    </Draggable>
  );
};

export default CoordinateList;
