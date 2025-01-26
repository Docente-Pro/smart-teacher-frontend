import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent } from "../ui/card";
import { Apple } from "lucide-react";
import { useNavigate } from "react-router";
function AreaCard({ area }) {
    const color = area.color;
    const navigate = useNavigate();
    return (_jsx(Card, { style: { backgroundColor: color }, className: "transition-transform hover:scale-105 cursor-pointer", onClick: () => navigate(`/competencias?area=${area.id}&nombre=${area.nombre}`), children: _jsxs(CardContent, { className: "text-center text-white flex flex-col items-center justify-center gap-4 p-6", children: [_jsx(Apple, { size: 48 }), _jsx("p", { className: "text-white font-semibold", children: area.descripcion })] }) }));
}
export default AreaCard;
