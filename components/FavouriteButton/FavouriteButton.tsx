import React, { useState } from "react";

import { useTranslation } from "hooks/useTranslation";
import { getItem, setItem } from "hooks/useLocalStorage";
import styles from "./FavouriteButton.module.scss";

type Props = {
  stationId: string;
  stationName: string;
};

type Favourite = { stationId: string; stationName: string };

export const FavouriteButton: React.FC<Props> = ({
  stationId,
  stationName,
}) => {
  const { t } = useTranslation();

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
    <button
      onClick={() => handleFavourite(stationId)}
      className={styles.iconButton}
    >
      <img
        src={`/icons/star${isFavourite ? "-filled" : ""}.svg`}
        alt=""
        className={styles.icon}
      />
      {isFavourite ? t("removeFromFavourites") : t("addToFavourites")}
    </button>
  );
};
