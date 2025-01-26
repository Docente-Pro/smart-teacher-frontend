interface FilterBarProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    categories: string[];
}
export declare function FilterBar({ searchTerm, setSearchTerm, selectedCategory, setSelectedCategory, categories }: FilterBarProps): import("react/jsx-runtime").JSX.Element;
export {};
