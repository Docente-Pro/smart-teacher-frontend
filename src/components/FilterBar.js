import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
export function FilterBar({ searchTerm, setSearchTerm, selectedCategory, setSelectedCategory, categories }) {
    return (_jsxs("div", { className: "flex flex-col md:flex-row gap-4 mb-8", children: [_jsx(Input, { type: "text", placeholder: "Buscar competencia...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "flex-grow" }), _jsxs(Select, { value: selectedCategory, onValueChange: setSelectedCategory, children: [_jsx(SelectTrigger, { className: "w-full md:w-[200px]", children: _jsx(SelectValue, { placeholder: "Categor\u00EDa" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "Todas las categor\u00EDas" }), categories.map((category) => (_jsx(SelectItem, { value: category, children: category }, category)))] })] })] }));
}
