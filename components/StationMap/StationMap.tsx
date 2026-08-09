import React, { useEffect, useRef, useState } from "react";
// maplibre-gl must stay on v5: v6 loads its web worker from a separate file
// that Next's bundler doesn't emit, which silently breaks GeoJSON sources
import { Map as MapLibreMap, NavigationControl, Popup } from "maplibre-gl";
import type {
  ExpressionSpecification,
  GeoJSONSource,
  MapLayerMouseEvent,
  Offset,
  PointLike,
} from "maplibre-gl";
import useSWRImmutable from "swr/immutable";

import { STATIONS_URL } from "constants/stations";
import { StationsMapData } from "types/api";
import { useTranslation } from "hooks/useTranslation";
import { fetcher } from "utils/fetcher";
import { LoadingDots } from "components/LoadingDots";
import styles from "./StationMap.module.scss";
import "maplibre-gl/dist/maplibre-gl.css";

// Map paint values can't read CSS variables, so the palette from
// styles/variables.scss is repeated here
const COLOR_FORREST = "#314023";
const COLOR_PIN_GREEN = "#5f7e44";
const COLOR_WHITE = "#ffffff";

// Station pin size in CSS pixels; the SVG rasterizes at 2x for retina
const PIN_WIDTH = 30;
const PIN_HEIGHT = 38;

// Teardrop map pin with a white outline and center hole, tip at the
// bottom so it points at the station coordinate
const pinSvg = () =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${PIN_WIDTH * 2}" height="${PIN_HEIGHT * 2}" viewBox="0 0 ${PIN_WIDTH} ${PIN_HEIGHT}">` +
  `<path d="M15 37 C12 31 2 23 2 14 A13 13 0 1 1 28 14 C28 23 18 31 15 37 Z" fill="${COLOR_PIN_GREEN}" stroke="${COLOR_WHITE}" stroke-width="2"/>` +
  `<circle cx="15" cy="14" r="5" fill="${COLOR_WHITE}"/>` +
  `</svg>`;

// The pin extends upward from its coordinate, so push the popup clear
// of it in every direction it can anchor
const POPUP_GAP = 4;
const OFFSET_ABOVE_PIN: PointLike = [0, -(PIN_HEIGHT + POPUP_GAP)];
const OFFSET_BELOW_TIP: PointLike = [0, POPUP_GAP];
const OFFSET_BESIDE_PIN = PIN_WIDTH / 2 + POPUP_GAP;
const POPUP_OFFSET: Offset = {
  top: OFFSET_BELOW_TIP,
  "top-left": OFFSET_BELOW_TIP,
  "top-right": OFFSET_BELOW_TIP,
  bottom: OFFSET_ABOVE_PIN,
  "bottom-left": OFFSET_ABOVE_PIN,
  "bottom-right": OFFSET_ABOVE_PIN,
  left: [OFFSET_BESIDE_PIN, -PIN_HEIGHT / 2],
  right: [-OFFSET_BESIDE_PIN, -PIN_HEIGHT / 2],
  center: [0, 0],
};

// Rasterizing the pin needs neither the map nor the station data, so
// it starts once and the decoded image is reused across remounts
let pinImagePromise: Promise<HTMLImageElement> | null = null;
const loadPinImage = () =>
  (pinImagePromise ??= new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
      pinSvg(),
    )}`;
  }));

export const StationMap: React.FC = () => {
  const { t, locale } = useTranslation();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<MapLibreMap | null>(null);

  // Static file behind a versioned url, so skip SWR revalidation
  const { data, error, isLoading } = useSWRImmutable<StationsMapData>(
    STATIONS_URL,
    fetcher,
  );

  // Initialize the map with OpenFreeMap vector tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Start rasterizing the pin icon in parallel with the style load
    loadPinImage();

    const map = new MapLibreMap({
      container: mapContainerRef.current,
      // Vector tiles (free, no API key) so label language can be set
      // client-side; the style bundles OSM attribution and font glyphs
      style: "https://tiles.openfreemap.org/styles/bright",
      center: [10, 30],
      zoom: 1.6,
      dragRotate: false,
      touchPitch: false,
    });

    // Keep two-finger pinch zoom, but don't let it rotate the map
    map.touchZoomRotate.disableRotation();

    map.addControl(new NavigationControl({ showCompass: false }));

    map.on("load", () => setMap(map));

    return () => {
      map.remove();
      setMap(null);
    };
  }, []);

  // Show base map labels in the site language, falling back to English
  // and then the local name
  useEffect(() => {
    if (!map) return;

    // Norwegian names are tagged as either name:no or name:nb in OSM
    const nameKeys =
      locale === "no" ? ["name:no", "name:nb"] : [`name:${locale}`];
    if (locale !== "en") nameKeys.push("name:en");

    const localizedName: ExpressionSpecification = [
      "coalesce",
      ...nameKeys.map((key): ExpressionSpecification => ["get", key]),
      ["get", "name"],
    ];

    for (const layer of map.getStyle().layers) {
      // Only rewrite base map labels, never our own station layers
      if (layer.type !== "symbol" || layer.source === "stations") continue;
      const textField = layer.layout?.["text-field"];
      if (!textField || !JSON.stringify(textField).includes("name")) continue;
      map.setLayoutProperty(layer.id, "text-field", localizedName);
    }
  }, [map, locale]);

  // Add stations as a clustered source once both map and data are ready
  useEffect(() => {
    if (!map || !data) return;
    if (map.getSource("stations")) return;

    const geojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: data.stations.map(([id, name, lat, lon]) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [lon, lat] },
        properties: { id, name },
      })),
    };

    // Clustering runs in a web worker, so ~24k points stay smooth
    map.addSource("stations", {
      type: "geojson",
      data: geojson,
      cluster: true,
      clusterMaxZoom: 11,
      clusterRadius: 40,
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

    const handleClusterClick = async (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      if (!feature) return;

      const source = map.getSource("stations") as GeoJSONSource;
      const zoom = await source.getClusterExpansionZoom(
        feature.properties.cluster_id,
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
        "lang",
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

      new Popup({
        offset: POPUP_OFFSET,
        closeButton: false,
        className: styles.popup,
      })
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
    map.on("mouseenter", "clusters", handleMouseEnter);
    map.on("mouseleave", "clusters", handleMouseLeave);

    // The pin icon rasterizes from SVG asynchronously, so the station
    // layer and its handlers are added once the image is ready
    let cancelled = false;
    loadPinImage()
      .then((pin) => {
        if (cancelled) return;

        map.addImage("stationPin", pin, { pixelRatio: 2 });

        map.addLayer({
          id: "stationPoints",
          type: "symbol",
          source: "stations",
          filter: ["!", ["has", "point_count"]],
          layout: {
            "icon-image": "stationPin",
            "icon-anchor": "bottom",
            // Symbols hide on collision by default; keep every pin visible
            "icon-allow-overlap": true,
          },
        });

        map.on("click", "stationPoints", handleStationClick);
        map.on("mouseenter", "stationPoints", handleMouseEnter);
        map.on("mouseleave", "stationPoints", handleMouseLeave);
      })
      .catch((error) => {
        console.error("Station pin icons failed to load", error);
      });

    return () => {
      cancelled = true;
    };
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
