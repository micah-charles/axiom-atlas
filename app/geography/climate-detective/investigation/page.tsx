"use client";

import ClimateDetectiveGame from "../../../games/climate-detective/ClimateDetectiveGame";

export default function ClimateDetectiveInvestigation() {
  return <ClimateDetectiveGame backLabel="Return to Climate Detective overview" onBack={() => { window.location.href = "/geography/climate-detective"; }} />;
}
