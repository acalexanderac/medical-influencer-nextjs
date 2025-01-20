interface Props {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

export default function ClaimFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange
}: Props) {
  return (
    <div className="flex gap-4 mb-4">
      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="p-2 border rounded"
      >
        <option value="">All Categories</option>
        {categories.map(category => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>

      <select
        value={selectedStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        className="p-2 border rounded"
      >
        <option value="">All Statuses</option>
        <option value="Verified">Verified</option>
        <option value="Questionable">Questionable</option>
        <option value="Debunked">Debunked</option>
      </select>
    </div>
  );
} 