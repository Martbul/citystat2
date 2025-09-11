import React, { useMemo } from "react";
import Mapbox, { ShapeSource } from "@rnmapbox/maps";
import { Feature, FeatureCollection, Geometry } from "geojson";

interface Props {
  visitedStreets: { streetId: string }[];
  streetData: FeatureCollection<Geometry>;
}

export default function VisitedStreetsLayer({
  visitedStreets,
  streetData,
}: Props) {
  const visitedFeatures = useMemo<Feature<Geometry>[]>(() => {
    if (!streetData?.features) return [];
    const visitedIds = visitedStreets.map((s) => s.streetId);
    //! dublicated visited street ids
    console.log("debugging visited streets component",visitedIds )
    return streetData.features.filter((f) =>
      visitedIds.includes(f.id as string)
    );
  }, [visitedStreets, streetData]);

  const visitedFeatureCollection: FeatureCollection<Geometry> = useMemo(
    () => ({
      type: "FeatureCollection",
      features: visitedFeatures,
    }),
    [visitedFeatures]
  );

  return (
    <ShapeSource id="visited_streets_source" shape={visitedFeatureCollection}>
      <Mapbox.LineLayer
        id="visited_streets_layer"
        style={{
          lineColor: "#51009cff",
          lineWidth: 3,
          lineOpacity: 0.6,
          lineCap: "round",
          lineJoin: "round",
        }}
      />
    </ShapeSource>
  );
}
