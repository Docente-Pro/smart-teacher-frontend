import AreaCard from "@/components/Area/AreaCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IArea } from "@/interfaces/IArea";
import { getAllAreas } from "@/services/areas.service";
import { useEffect, useState } from "react";

function Areas() {
  const [wordToFilter, setWordToFilter] = useState("");
  const [areas, setAreas] = useState<IArea[]>();
  const [filteredAreas, setFilteredAreas] = useState<IArea[]>();

  useEffect(() => {
    getAllAreas().then((response) => {
      setAreas(response.data.data);
      setFilteredAreas(response.data.data);
    });
  }, []);

  useEffect(() => {
    if (areas) {
      setFilteredAreas(filterAreas());
    }
  }, [wordToFilter]);

  function filterAreas() {
    if (areas) {
      return areas.filter((area) => {
        return area.nombre.toLowerCase().includes(wordToFilter.toLowerCase());
      });
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Sectores Educativos</h1>
        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="Filtrar sectores..."
            value={wordToFilter}
            onChange={(e) => setWordToFilter(e.target.value)}
            className="max-w-sm"
          />
          <Button onClick={() => setWordToFilter("")}>Limpiar</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredAreas && filteredAreas.map((area) => <AreaCard key={area.id} area={area} />)}
      </div>
    </div>
  );
}

export default Areas;
