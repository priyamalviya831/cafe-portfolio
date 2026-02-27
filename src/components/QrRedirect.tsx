import { Navigate, useParams, useLocation } from "react-router-dom";

export default function QrRedirect() {
  const { qrId } = useParams();
  const location = useLocation();

  // Only QR entry + only initial navigation
  if (qrId && location.key === "default") {
    return <Navigate to="menu" replace />;
  }

  return null;
}