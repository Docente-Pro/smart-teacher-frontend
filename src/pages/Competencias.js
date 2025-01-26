import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import CompetenciasGrid from "@/components/CompetenciasGrid";
import { FilterBar } from "../components/FilterBar";
import { getAllCompetencies } from "@/services/competencias.service";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { getAreaById } from "@/services/areas.service";
import { ArrowLeft } from "lucide-react";
function Competencias() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [competencias, setCompetencias] = useState();
    const [filteredCompetencies, setFilteredCompetencies] = useState();
    const [isByAreaID, setIsByAreaID] = useState();
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
        }
        else {
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
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "flex items-center mb-8 gap-2", children: [_jsx(ArrowLeft, { className: "cursor-pointer", onClick: () => navigate(-1) }), _jsx("h1", { className: "text-2xl font-bold", children: "Competencias Educativas" })] }), competencias && filteredCompetencies && isByAreaID && (_jsxs(_Fragment, { children: [_jsx(FilterBar, { searchTerm: searchTerm, setSearchTerm: setSearchTerm, selectedCategory: selectedCategory, setSelectedCategory: setSelectedCategory, categories: [] }), isByAreaID ? (_jsx(CompetenciasGrid, { competencies: filteredCompetencies, byAreaID: isByAreaID, areaName: nombreArea })) : (_jsx(CompetenciasGrid, { competencies: filteredCompetencies, byAreaID: isByAreaID }))] }))] }));
}
export default Competencias;
