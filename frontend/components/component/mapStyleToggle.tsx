import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function MapStyleToggle({
  onStyleChange,
}: {
  onStyleChange: Function;
}) {

  const handleChange = (newValue: string) => {
    onStyleChange(`mapbox://styles/mapbox/${newValue}`);
  };

  return (
    <div
      className="flex flex-col items-left divide-x"
    >
      <RadioGroup defaultValue="streets-v12" className="text-primary dark:text-gray-300" onValueChange={handleChange}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="streets-v12" id="streets-v12"/>
          <Label htmlFor="streets-v12">Streets</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="satellite-streets-v12" id="satellite-streets-v12" />
          <Label htmlFor="satellite-streets-v12">Satellite</Label>
        </div>
      </RadioGroup>
    </div>
  );
}