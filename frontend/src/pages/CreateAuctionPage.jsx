import { useNavigate } from "react-router-dom";
import CreateAuction from "./CreateAuction";

export default function CreateAuctionPage() {
  const navigate = useNavigate();
  return (
    <CreateAuction
      onCreated={(created) => navigate(`/auction/${created._id}`)}
      onBack={() => navigate("/")}
    />
  );
}
