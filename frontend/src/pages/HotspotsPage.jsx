import { useState } from "react";
import { MapPinned } from "lucide-react";
import HotspotMap from "../components/hotspots/HotspotMap";
import HotspotList from "../components/hotspots/HotspotList";
import HotspotDetailPanel from "../components/hotspots/HotspotDetailPanel";
import RiskLegend from "../components/hotspots/RiskLegend";
import { useApi } from "../hooks/useApi";
import { hotspotsApi } from "../api/endpoints";
import { Loading, ErrorState } from "../components/common/StatusState";
import { PageHeader } from "./DashboardPage";

export default function HotspotsPage() {
  const [selectedId, setSelectedId] = useState(null);
  const { data, error, loading } = useApi(() => hotspotsApi.list(1, 300), []);

  return (
    <div className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
      <PageHeader
        icon={MapPinned}
        title="Hotspot explorer"
        subtitle="Places where accidents cluster together geographically, colored by how risky each cluster is. Click a circle on the map, or a row in the list below, to see the full picture."
      />

      {loading && <Loading label="Finding accident clusters…" />}
      {error && <ErrorState error={error} />}

      {data && (
        <div className="space-y-6 animate-fade-up">
          <div className="grid lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 relative">
              <HotspotMap hotspots={data} selectedId={selectedId} onSelect={setSelectedId} />
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-[600] pointer-events-none">
                <div className="pointer-events-auto inline-block">
                  <RiskLegend />
                </div>
              </div>
            </div>
            <div className="lg:sticky lg:top-32">
              <HotspotDetailPanel hotspotId={selectedId} />
            </div>
            <div className="lg:col-span-3">
              <HotspotList hotspots={data} selectedId={selectedId} onSelect={setSelectedId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
