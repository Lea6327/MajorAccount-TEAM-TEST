import PropertyCard, { type InternalProperty } from "./components/PropertyCard";


const demo: InternalProperty = {
  fullAddress: "10 Example St, Carlton VIC 3053",
  lotPlan: { lot: "12", plan: "PS123456" },
  volumeFolio: { volume: null, folio: null },
  status: "UnknownVolFol",
  sourceTrace: { provider: "VIC-DDP", requestId: "REQ-12345", receivedAt: "2025-08-30T03:12:45Z" }
};

export default function App() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <PropertyCard initial={demo} />
    </div>
  );
}