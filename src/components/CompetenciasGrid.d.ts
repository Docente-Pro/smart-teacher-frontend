import { ICompetencia } from "../interfaces/ICompetencia";
interface CompetenciesGridProps {
    competencies: ICompetencia[];
    byAreaID: boolean;
    areaName?: string;
}
declare function CompetenciasGrid({ competencies, byAreaID, areaName }: CompetenciesGridProps): import("react/jsx-runtime").JSX.Element;
export default CompetenciasGrid;
