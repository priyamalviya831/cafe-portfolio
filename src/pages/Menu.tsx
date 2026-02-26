import { useState, useMemo } from "react";
import { MenuSection } from "@/components/MenuSection";
import { useLayout } from "@/context/LayoutContext";

export default function Menu() {
  const { menuItems } = useLayout();
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    if (!search) return menuItems;
    return menuItems.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, menuItems]);

  return (
    <div className="pt-16">
      <MenuSection showAll forceItems={filteredItems}  mode="page" search={search}
        onSearchChange={setSearch}/>
    </div>
  );
}