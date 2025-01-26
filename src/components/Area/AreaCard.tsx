import { Card, CardContent } from "../ui/card";
import { Apple } from "lucide-react";
import { IArea } from "@/interfaces/IArea";
import { useNavigate } from "react-router";

interface EducationCardProps {
  area: IArea;
}

function AreaCard({ area }: EducationCardProps) {
  const color = area.color;

  const navigate = useNavigate();

  return (
    <Card
      style={{ backgroundColor: color }}
      className="transition-transform hover:scale-105 cursor-pointer"
      onClick={() => navigate(`/competencias?area=${area.id}&nombre=${area.nombre}`)}
    >
      <CardContent className="text-center text-white flex flex-col items-center justify-center gap-4 p-6">
        <Apple size={48} />
        <p className="text-white font-semibold">{area.descripcion}</p>
      </CardContent>
    </Card>
  );
}

export default AreaCard;
