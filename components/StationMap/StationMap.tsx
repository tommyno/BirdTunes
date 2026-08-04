import React, { useEffect, useRef, useState } from "react";
// maplibre-gl must stay on v5: v6 loads its web worker from a separate file
// that Next's bundler doesn't emit, which silently breaks GeoJSON sources
import { Map as MapLibreMap, NavigationControl, Popup } from "maplibre-gl";
import type { GeoJSONSource, MapLayerMouseEvent } from "maplibre-gl";
import useSWRImmutable from "swr/immutable";

import { StationsMapData } from "types/api";
import { useTranslation } from "hooks/useTranslation";
import { fetcher } from "utils/fetcher";
import { LoadingDots } from "components/LoadingDots";
import styles from "./StationMap.module.scss";
import "maplibre-gl/dist/maplibre-gl.css";

// Map paint values can't read CSS variables, so the palette from
// styles/variables.scss is repeated here
const COLOR_FORREST = "#314023";
const COLOR_GRAY = "#757575";
const COLOR_WHITE = "#ffffff";

export const StationMap: React.FC = () => {
  const { t } = useTranslation();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<MapLibreMap | null>(null);

  // The station data only changes once a day, so skip SWR revalidation
  const { data, error, isLoading } = useSWRImmutable<StationsMapData>(
    "/api/stations",
    fetcher
  );

  // Initialize the map with OpenStreetMap raster tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new MapLibreMap({
      container: mapContainerRef.current,
      style: {
        version: 8,
        // Font glyphs are required for the cluster count labels
        glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            maxzoom: 19,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
          },
        },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      },
      center: [10, 30],
      zoom: 1.6,
    });

    map.addControl(new NavigationControl({ showCompass: false }));

    map.on("load", () => setMap(map));

    return () => {
      map.remove();
      setMap(null);
    };
  }, []);

  // Add stations as a clustered source once both map and data are ready
  useEffect(() => {
    if (!map || !data) return;
    if (map.getSource("stations")) return;

    const geojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: data.stations.map(([id, name, lat, lon, active]) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [lon, lat] },
        properties: { id, name, active },
      })),
    };

    // Clustering runs in a web worker, so ~24k points stay smooth
    map.addSource("stations", {
      type: "geojson",
      data: geojson,
      cluster: true,
      clusterMaxZoom: 11,
      clusterRadius: 50,
    });

    map.addLayer({
      id: "clusters",
      type: "circle",
      source: "stations",
      filter: ["has", "point_count"],
      paint: {
        "circle-color": COLOR_FORREST,
        "circle-opacity": 0.85,
        "circle-radius": [
          "step",
          ["get", "point_count"],
          16,
          100,
          22,
          1000,
          28,
        ],
        "circle-stroke-width": 2,
        "circle-stroke-color": COLOR_WHITE,
      },
    });

    map.addLayer({
      id: "clusterCounts",
      type: "symbol",
      source: "stations",
      filter: ["has", "point_count"],
      layout: {
        "text-field": ["get", "point_count_abbreviated"],
        "text-font": ["Noto Sans Regular"],
        "text-size": 12,
      },
      paint: {
        "text-color": COLOR_WHITE,
      },
    });

    map.addLayer({
      id: "stationPoints",
      type: "circle",
      source: "stations",
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": [
          "match",
          ["get", "active"],
          1,
          COLOR_FORREST,
          COLOR_GRAY,
        ],
        "circle-radius": 6,
        "circle-stroke-width": 1.5,
        "circle-stroke-color": COLOR_WHITE,
      },
    });

    const handleClusterClick = async (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      if (!feature) return;

      const source = map.getSource("stations") as GeoJSONSource;
      const zoom = await source.getClusterExpansionZoom(
        feature.properties.cluster_id
      );
      const geometry = feature.geometry as GeoJSON.Point;

      map.easeTo({
        center: geometry.coordinates as [number, number],
        zoom,
      });
    };

    const handleStationClick = (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      if (!feature) return;

      const { id, name } = feature.properties as { id: string; name: string };
      const geometry = feature.geometry as GeoJSON.Point;

      // Read lang from the url directly; this handler lives outside React
      const currentLang = new URLSearchParams(window.location.search).get(
        "lang"
      );

      // Build popup content as DOM nodes so station names can't inject HTML
      const stationLink = document.createElement("a");
      stationLink.href = `/?station=${id}${
        currentLang ? `&lang=${currentLang}` : ""
      }`;
      stationLink.className = styles.popupLink;

      const stationId = document.createElement("span");
      stationId.className = styles.popupId;
      stationId.textContent = `#${id}`;

      stationLink.append(stationId, ` ${name}`);

      new Popup({ offset: 12, closeButton: false, className: styles.popup })
        .setLngLat(geometry.coordinates as [number, number])
        .setDOMContent(stationLink)
        .addTo(map);
    };

    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = "";
    };

    map.on("click", "clusters", handleClusterClick);
    map.on("click", "stationPoints", handleStationClick);
    map.on("mouseenter", "clusters", handleMouseEnter);
    map.on("mouseleave", "clusters", handleMouseLeave);
    map.on("mouseenter", "stationPoints", handleMouseEnter);
    map.on("mouseleave", "stationPoints", handleMouseLeave);
  }, [map, data]);

  return (
    <div className={styles.wrap}>
      <div ref={mapContainerRef} className={styles.map} />

      {isLoading && (
        <p className={styles.status}>
          {t("loadingStations")}
          <LoadingDots />
        </p>
      )}

      {error && <p className={styles.status}>{t("stationsError")}</p>}
    </div>
  );
};
