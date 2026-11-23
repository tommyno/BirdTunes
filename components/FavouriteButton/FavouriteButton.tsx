import React, { useState } from "react";

import { FAVOURITES_STORAGE_KEY } from "constants/storage";
import { Favourite } from "types/favourites";
import { useTranslation } from "hooks/useTranslation";
import { getItem, setItem } from "utils/localStorage";
import styles from "./FavouriteButton.module.scss";

type Props = {
  stationId: string;
  stationName: string;
};

export const FavouriteButton: React.FC<Props> = ({
  stationId,
  stationName,
}) => {
  const { t } = useTranslation();

  const favourites: Favourite[] = getItem(FAVOURITES_STORAGE_KEY);
  const [isFavourite, setIsFavourite] = useState(
    favourites.some((fav) => fav.stationId === stationId)
  );

  const handleFavourite = () => {
    const updatedFavourites = isFavourite
      ? favourites.filter((fav) => fav.stationId !== stationId)
      : [...favourites, { stationId, stationName }];

    setItem(FAVOURITES_STORAGE_KEY, JSON.stringify(updatedFavourites));
    setIsFavourite(!isFavourite);
  };

  return (
    <button onClick={handleFavourite} className={styles.iconButton}>
      <img
        src={`/icons/star${isFavourite ? "-filled" : ""}.svg`}
        alt=""
        className={styles.icon}
      />
      {isFavourite ? t("removeFromFavourites") : t("addToFavourites")}
    </button>
  );
};
