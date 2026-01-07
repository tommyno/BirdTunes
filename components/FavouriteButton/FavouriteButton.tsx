import React, { useState } from "react";

import styles from "./FavouriteButton.module.scss";
import { getItem, setItem } from "hooks/useLocalStorage";

type Props = {
  stationId: string;
  stationName: string;
};

type Favourite = { stationId: string; stationName: string };

export const FavouriteButton: React.FC<Props> = ({
  stationId,
  stationName,
}) => {
  // Handle favourites
  const favourites: Favourite[] = getItem("birdtunes-favourites");
  const [isFavourite, setIsFavourite] = useState(
    favourites.some((fav) => fav.stationId === stationId)
  );

  const handleFavourite = (stationId: string) => {
    const updatedFavourites = isFavourite
      ? favourites.filter((fav) => fav.stationId !== stationId)
      : [...favourites, { stationId, stationName }];

    setItem("birdtunes-favourites", JSON.stringify(updatedFavourites));
    setIsFavourite(!isFavourite);
  };

  return (
    <button onClick={() => handleFavourite(stationId)}>
      <img
        src={`/icons/star${isFavourite ? "-filled" : ""}.svg`}
        alt="Favorite"
        title={`${isFavourite ? "Remove from" : "Add to"} favourites`}
        className={styles.icon}
      />
    </button>
  );
};
