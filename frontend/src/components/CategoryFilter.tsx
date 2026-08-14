interface CategoryFilterProps {
  categories: string[];
  selectedCategories: string[];
  onToggle: (category: string) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategories,
  onToggle,
}: CategoryFilterProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1"
      style={{ scrollbarWidth: "none" }}
    >
      {categories.map((cat) => {
        const selected = selectedCategories.includes(cat);
        return (
          <button
            key={cat}
            onClick={() => onToggle(cat)}
            className="shrink-0 cursor-pointer px-4 py-1.5 rounded-full text-sm font-medium border transition"
            style={
              selected
                ? {
                    backgroundColor: "var(--primary-color, #2563EB)",
                    color: "#fff",
                    borderColor: "transparent",
                  }
                : {
                    backgroundColor: "var(--card-color)",
                    color: "var(--text-color)",
                    borderColor: "rgba(128,128,128,.3)",
                  }
            }
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        );
      })}
    </div>
  );
}