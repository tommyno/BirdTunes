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

  return (
    <>
      <Head>
        <meta title="Fuglesang" />
        <meta
          name="description"
          content="Lyttestasjon for fugler i nærområdet"
        />
      </Head>

      <div>
        <h1>Fuglesang</h1>

        {!isLoadingStation && (
          <div>
            <h2>Totalt</h2>
            <h3>{stationData?.detections || 0} observasjoner </h3>
            <h3>{stationData?.species || 0} ulike arter</h3>
            {stationError && <p>{stationError.toString()}</p>}
          </div>
        )}

        {!isLoadingSpecies && (
          <div>
            <h2>Arter</h2>
            {speciesData?.map((species) => (
              <div key={species.id}>
                <h3>
                  {species.commonName} ({species.scientificName})
                </h3>
                <p>{species.detections.total} observasjoner</p>
                <p>Hørt for {timeAgo(species.latestDetectionAt)}</p>
                <img src={species.imageUrl} alt={species.commonName} />
              </div>
            ))}
            {speciesError && <p>{speciesError.toString()}</p>}
          </div>
        )}
      </div>
    </>
  );
}
