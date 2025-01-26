import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
function CompetenciasGrid({ competencies, byAreaID, areaName }) {
    return (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", children: competencies.map((competency) => (_jsxs(Card, { className: "cursor-pointer", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: competency.nombre }) }), _jsx(CardContent, { children: byAreaID ? (_jsx("p", { className: "text-sm text-muted-foreground", children: areaName })) : (_jsx("p", { className: "text-sm text-muted-foreground", children: competency.area.nombre })) })] }, competency.id))) }));
}
export default CompetenciasGrid;
