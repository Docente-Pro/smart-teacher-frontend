import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import AreaCard from "@/components/Area/AreaCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAllAreas } from "@/services/areas.service";
import { useEffect, useState } from "react";
function Areas() {
    const [wordToFilter, setWordToFilter] = useState("");
    const [areas, setAreas] = useState();
    const [filteredAreas, setFilteredAreas] = useState();
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
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-3xl font-bold mb-4", children: "Sectores Educativos" }), _jsxs("div", { className: "flex gap-4", children: [_jsx(Input, { type: "text", placeholder: "Filtrar sectores...", value: wordToFilter, onChange: (e) => setWordToFilter(e.target.value), className: "max-w-sm" }), _jsx(Button, { onClick: () => setWordToFilter(""), children: "Limpiar" })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: filteredAreas && filteredAreas.map((area) => _jsx(AreaCard, { area: area }, area.id)) })] }));
}
export default Areas;
