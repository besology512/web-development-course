"use client";

import { useRouter } from "next/navigation";
import { Filter } from "lucide-react";

export default function FilterButton() {
  const router = useRouter();

  const handleFilter = () => {
    // This could update search params or navigate to a filtered view
    console.log("Filtering sensors...");
    // For demonstration, let's navigate to home
    // router.push('/'); 
    alert("Filter functionality would go here! (Using useRouter hook)");
  };

  return (
    <button
      onClick={handleFilter}
      className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm font-medium shadow-sm hover:bg-accent transition-colors"
    >
      <Filter className="h-4 w-4" />
      Filter Online
    </button>
  );
}
