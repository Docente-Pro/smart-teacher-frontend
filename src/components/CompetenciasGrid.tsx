import { ICompetencia } from "../interfaces/ICompetencia";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface CompetenciesGridProps {
  competencies: ICompetencia[];
  byAreaID: boolean;
  areaName?: string;
}

function CompetenciasGrid({ competencies, byAreaID, areaName }: CompetenciesGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {competencies.map((competency) => (
        <Card key={competency.id} className="cursor-pointer">
          <CardHeader>
            <CardTitle>{competency.nombre}</CardTitle>
          </CardHeader>
          <CardContent>
            {byAreaID ? (
              <p className="text-sm text-muted-foreground">{areaName!}</p>
            ) : (
              <p className="text-sm text-muted-foreground">{competency.area.nombre}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default CompetenciasGrid;