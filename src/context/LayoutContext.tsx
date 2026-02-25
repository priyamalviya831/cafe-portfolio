import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LayoutType, CafeConfig, CafeBootstrapResponse, MenuItem } from "@/types/cafe";
import { APIRequest } from "@/utils/APIRequest";
import { useParams } from "react-router-dom";
import { LAYOUTS } from "@/utils/constants";
import API_ROUTES from "@/utils/api_constant";
import { useFetch } from "@/utils/useApi";

const ELEGANT_ID = import.meta.env.VITE_ELEGANT_LAYOUT_ID;
const COZY_ID = import.meta.env.VITE_COZY_LAYOUT_ID;

interface LayoutContextType {
  layoutType: LayoutType;
  config?: CafeConfig;
  cafeId?: string;

  menuItems: MenuItem[];
  categories: string[];
  gstPercentage: number;

  tableNumber: string | null;
  setTableNumber: (value: string) => void;
  isFromQR: boolean;
  isPreview: boolean;
  qrId?: string;

  isLoading: boolean;
  error: unknown;

   isLayoutFromQR: boolean;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

const resolveLayoutFromId = (id?: string): LayoutType => {
  if (id === ELEGANT_ID) return LAYOUTS.ELEGANT;
  if (id === COZY_ID) return LAYOUTS.COZY;
  return LAYOUTS.ELEGANT;
};

// const getFinalLayout = (
//   data: CafeBootstrapResponse | undefined,
//   urlLayoutId?: string
// ): LayoutType => {
//   if (!data) return LAYOUTS.ELEGANT;
//   const { result } = data;
//   if (urlLayoutId) {
//     return resolveLayoutFromId(urlLayoutId);
//   }
//   return resolveLayoutFromId(result.defaultLayoutId);
// };
const getFinalLayout = (layoutId?: string): LayoutType => {
  return resolveLayoutFromId(layoutId);
};

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const { qrId } = useParams<{ qrId?: string; }>();

  const isPreview = !qrId;

  const { data: tableData, isLoading, error } = useFetch(
    qrId ? ["get-table-by-qr", qrId] : null,
    qrId ? `${API_ROUTES.getTableByQr}/${qrId}` : null, {},
    {
      enabled: true
    }  
  );

  const qrLayoutId = tableData?.result?.layoutId;
   const adminId = tableData?.result?.adminId?._id;

   const isLayoutFromQR = !!qrLayoutId;

    const layoutApiUrl = qrLayoutId
    ? `${API_ROUTES.getLayoutById}/${qrLayoutId}` // ✅ QR layout
    : adminId
    ? `${API_ROUTES.getActiveLayout}/${adminId}` // ✅ fallback
    : null;

     const {
    data: layoutData,
    isLoading: isLayoutLoading,
    error: layoutError,
  } = useFetch(
    layoutApiUrl ? ["get-layout", qrLayoutId || adminId] : null,
    layoutApiUrl,
    {},
    { enabled: !!layoutApiUrl }
  );

  const tableNo = tableData?.result?.tableNumber;
  const [tableNumber, setTableNumber] = useState<string | null>(null);

  useEffect(() => {
    if (tableNo !== undefined) {
      setTableNumber(String(tableNo));
    } else if (layoutData?.result?.adminId?.role === 'superAdmin') {
      setTableNumber("1");
    }
  }, [tableNo, layoutData])

  // const layoutId = layoutData?.result?.layoutId
  const layoutId = isLayoutFromQR? qrLayoutId: layoutData?.result?.defaultLayoutId;
  // const layoutType = getFinalLayout(layoutData, layoutId);
  const layoutType = getFinalLayout(layoutId);

  useEffect(() => {
    if (!layoutData?.result) return;

    const cafeName = layoutData.result.adminId?.cafeName || "Cafe";
    const logo = layoutData.result.adminId.logo || "/favicon.ico";
    const description =
      layoutData.result.cafeDescription || `Welcome to ${cafeName}`;

    document.title = cafeName;
    updateFavicon(logo);
    updateMeta("description", description);
    updateMetaProperty("og:title", cafeName);
    updateMetaProperty("og:description", description);
    updateMetaProperty("og:image", logo);
    updateMetaProperty("twitter:title", cafeName);
    updateMetaProperty("twitter:description", description);
    updateMetaProperty("twitter:image", logo);
  }, [layoutData]);

  const menuItems: MenuItem[] =
    layoutData?.result?.menus?.map((item: any) => ({
      ...item,
      id: item._id,
    })) || [];

  const categories: string[] = Array.from(
    new Set(menuItems.map((item) => item.category))
  );

  const gstPercentage =
    layoutData?.result?.adminId?.gst ?? 5;

  return (
    <LayoutContext.Provider
      value={{
        layoutType,
        config: layoutData?.result,
        cafeId: layoutData?.result?._id,
        menuItems,
        categories,
        gstPercentage,
         isLayoutFromQR,
        tableNumber,
        setTableNumber,
        isFromQR: !!qrId,
        isPreview,
        qrId,
        isLoading: isLoading || isLayoutLoading,
        error: layoutError || error,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) throw new Error("useLayout must be used within LayoutProvider");
  return context;
}
function updateFavicon(href: string) {
  document
    .querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]')
    .forEach(el => el.remove());

  const link = document.createElement("link");
  link.rel = "icon";
  link.type = "image/png";
  link.href = `${href}?v=${Date.now()}`; // cache bust
  document.head.appendChild(link);
}

function updateMeta(name: string, content: string) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function updateMetaProperty(property: string, content: string) {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}
