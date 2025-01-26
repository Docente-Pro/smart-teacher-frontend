import { ICompetencia } from "../interfaces/ICompetencia";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { ArrowLeft } from "lucide-react";
import CompetenciasGrid from "@/components/CompetenciasGrid";
import { FilterBar } from "@/components/FilterBar";
import { getAllCompetencies } from "@/services/competencias.service";
import { getAreaById } from "@/services/areas.service";

function Competencias() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [competencias, setCompetencias] = useState<ICompetencia[]>();
  const [filteredCompetencies, setFilteredCompetencies] = useState<ICompetencia[]>();
  const [isByAreaID, setIsByAreaID] = useState<boolean>();

  const navigate = useNavigate();

  // Capturar el parámetro area de la URL
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const area = params.get("area");
  const nombreArea = params.get("nombre");

  useEffect(() => {
    if (area) {
      setIsByAreaID(true);
      getAreaById(parseInt(area)).then((response) => {
        setCompetencias(response.data.data.competencias);
      });
    } else {
      setIsByAreaID(false);
      getAllCompetencies().then((response) => {
        setCompetencias(response.data.data);
      });
    }
  }, []);

  console.log(competencias);

  useEffect(() => {
    handleChange();
  }, [searchTerm, competencias]);

  function handleChange() {
    if (competencias) {
      const filteredCompetencies = competencias.filter((competency) => {
        return competency.nombre.toLowerCase().includes(searchTerm.toLowerCase()) && selectedCategory === "";
      });

      setFilteredCompetencies(filteredCompetencies);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8 gap-2">
        <ArrowLeft className="cursor-pointer" onClick={() => navigate(-1)} />
        <h1 className="text-2xl font-bold">Competencias Educativas</h1>
      </div>
      {competencias && filteredCompetencies && isByAreaID && (
        <>
          <FilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={[]}
          />
          {isByAreaID ? (
            <CompetenciasGrid competencies={filteredCompetencies} byAreaID={isByAreaID} areaName={nombreArea!} />
          ) : (
            <CompetenciasGrid competencies={filteredCompetencies} byAreaID={isByAreaID} />
          )}
        </>
      )}
    </div>
  );
}

export default Competencias;
