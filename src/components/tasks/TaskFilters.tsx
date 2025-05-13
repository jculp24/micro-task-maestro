
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface TaskFiltersProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const categories = [
  { id: null, name: "All" },
  { id: "food", name: "Food & Drink" },
  { id: "tech", name: "Technology" },
  { id: "fashion", name: "Fashion" },
  { id: "entertainment", name: "Entertainment" },
  { id: "travel", name: "Travel" },
  { id: "health", name: "Health & Fitness" },
  { id: "finance", name: "Finance" },
];

const TaskFilters = ({ selectedCategory, onSelectCategory }: TaskFiltersProps) => {
  return (
    <div className="py-2">
      <ScrollArea className="-mx-4">
        <div className="flex gap-2 px-4">
          {categories.map((category) => (
            <Button
              key={category.id || "all"}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className={`whitespace-nowrap ${
                selectedCategory === category.id 
                ? "bg-bronze hover:bg-bronze-dark text-white" 
                : "border-bronze/30 text-muted-foreground hover:border-bronze/60"
              }`}
              onClick={() => onSelectCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default TaskFilters;
