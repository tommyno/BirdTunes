import { useState } from "react";
import { useStationSearch } from "../hooks/useStationSearch";

export const StationSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { stations, loading, error, searchStations } = useStationSearch();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchStations(searchTerm);
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search stations..."
          aria-label="Search stations"
        />
        <button type="submit" disabled={loading}>
          Search
        </button>
      </form>

      {error && <p className="error">{error}</p>}
      {loading && <p>Loading...</p>}

      <ul>
        {stations.map((station) => (
          <li key={station.id}>
            <h3>{station.name}</h3>
            <p>{station.location}</p>
            <p>
              {station.continent}, {station.country}, {station.state},{" "}
              {Number(station.weather.temp - 273.15).toFixed(1)}°C
            </p>
            <p>
              Coordinates: {station.coords.lat}, {station.coords.lon}
            </p>
            <p>Type: {station.type}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};
