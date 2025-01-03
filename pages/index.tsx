import { BirdCard } from "components/BirdCard";
import { BirdCardGrid } from "components/BirdCardGrid";
import { Button } from "components/Button";
import { Settings } from "components/Settings";
import { Spinner } from "components/Spinner";
import { STATION_ID } from "constants/birdweather";
import { useFetchSpecies } from "hooks/useFetchSpecies";
import { useFetchStation } from "hooks/useFetchStation";
import Head from "next/head";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useMemo } from "react";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isReady = router.isReady && searchParams !== null;

  // Only get params after router is ready
  const stationId = isReady ? searchParams.get("station") || STATION_ID : null;
  const locale = isReady ? searchParams.get("locale") || "no" : null;
  const period = isReady ? searchParams.get("period") || "all" : null;
  const searchFilter = isReady
    ? searchParams.get("search")?.toString()?.toLowerCase()
    : "";

  const {
    data: speciesData = [],
    isLoading: isLoadingSpecies,
    error: speciesError,
  } = useFetchSpecies({
    stationId,
    locale,
    period,
    enabled: isReady,
  });

  const { data: stationData } = useFetchStation(stationId);

  const speciesActive = [...speciesData].sort(
    (a, b) =>
      new Date(b.latestDetectionAt).getTime() -
      new Date(a.latestDetectionAt).getTime()
  );
  const speciesObservations = [...speciesData].sort(
    (a, b) => b.detections.total - a.detections.total
  );

  // Toggle different views
  const { sort = "active" } = router.query;
  const handleSortBy = (sortBy: string) => {
    router.push({ query: { ...router.query, sort: sortBy } });
  };

  const filteredSpecies = useMemo(() => {
    const speciesList =
      sort === "observations" ? speciesObservations : speciesActive;
    if (!searchFilter) return speciesList;

    return speciesList?.filter(
      (species) =>
        species.commonName.toLowerCase().includes(searchFilter) ||
        species.scientificName.toLowerCase().includes(searchFilter)
    );
  }, [sort, speciesObservations, speciesActive, searchFilter]);

  return (
    <>
      <Head>
        <meta title="Fuglesang" />
        <meta
          name="description"
          content="Lyttestasjon for fugler i nærområdet"
        />
        <meta property="og:title" content="Fuglesang" />
        <meta
          property="og:description"
          content="Lyttestasjon for fugler i nærområdet"
        />
        <meta property="og:image" content="/open-graph-share.png" />
      </Head>

      <div className="wrap">
        <h1>Fuglesang</h1>

        {!isLoadingSpecies && (
          <Settings
            speciesData={speciesData}
            speciesError={speciesError}
            stationId={stationId}
            stationName={stationData?.name}
          />
        )}

        <div style={{ margin: "16px 0 24px" }}>
          <Button
            onClick={() => handleSortBy("active")}
            isActive={sort === "active"}
          >
            Sist hørt
          </Button>
          <Button
            onClick={() => handleSortBy("observations")}
            isActive={sort === "observations"}
          >
            Flest besøk
          </Button>
        </div>

        {!isLoadingSpecies && (
          <div>
            <BirdCardGrid>
              {filteredSpecies?.map((species) => (
                <BirdCard key={species.id} data={{ ...species, stationId }} />
              ))}
            </BirdCardGrid>

            {speciesError && <p>{speciesError.toString()}</p>}
          </div>
        )}

        {isLoadingSpecies && <Spinner />}

        {!isLoadingSpecies && (
          <div className="footer">
            <div></div>
            <a href="#" className="link">
              Til toppen ↑
            </a>
            <a href="https://github.com/tommyno/fuglesang" className="link">
              Github ↗
            </a>
          </div>
        )}
      </div>
    </>
  );
}
