import { BirdCard } from "components/BirdCard";
import { BirdCardGrid } from "components/BirdCardGrid";
import { useFetchSpecies } from "hooks/useFetchSpecies";
import { useFetchStation } from "hooks/useFetchStation";
import Head from "next/head";
import { timeAgo } from "utils/date";

export default function Home() {
  // Fetch station data
  const {
    data: stationData,
    isLoading: isLoadingStation,
    error: stationError,
  } = useFetchStation();

  // Fetch species data
  const {
    data: speciesData,
    isLoading: isLoadingSpecies,
    error: speciesError,
  } = useFetchSpecies();

  // Sort by latest detection
  const speciesLatest = [...speciesData].sort(
    (a, b) =>
      new Date(b.latestDetectionAt).getTime() -
      new Date(a.latestDetectionAt).getTime()
  );

  return (
    <>
      <Head>
        <meta title="Fuglesang" />
        <meta
          name="description"
          content="Lyttestasjon for fugler i nærområdet"
        />
      </Head>

      <div className="wrap">
        <h1>Fuglesang</h1>

        {!isLoadingStation && (
          <div style={{ margin: "16px 0" }}>
            <h3>{stationData?.detections || 0} observasjoner </h3>
            <h3>{stationData?.species || 0} ulike arter</h3>
            {stationError && <p>{stationError.toString()}</p>}
          </div>
        )}

        {!isLoadingSpecies && (
          <div>
            <h2 className="h3">Sist observerte arter</h2>
            <BirdCardGrid>
              {speciesLatest?.map((species) => (
                <BirdCard data={species} key={species.id} />
              ))}
            </BirdCardGrid>

            {speciesError && <p>{speciesError.toString()}</p>}
          </div>
        )}
      </div>
    </>
  );
}
