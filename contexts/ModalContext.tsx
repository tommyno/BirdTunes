import React, { createContext, useContext, useState } from "react";

import { BirdModalData } from "types/birdModal";
import { BirdModal } from "components/BirdModal";

type ModalContextType = {
  openBirdModal: (bird: BirdModalData) => void;
  closeModal: () => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

type Props = {
  children: React.ReactNode;
};

export const ModalProvider: React.FC<Props> = ({ children }) => {
  const [bird, setBird] = useState<BirdModalData | null>(null);

  const openBirdModal = (birdData: BirdModalData) => {
    setBird(birdData);
  };

  const closeModal = () => {
    setBird(null);
  };

  return (
    <ModalContext.Provider value={{ openBirdModal, closeModal }}>
      {children}
      {bird && <BirdModal data={bird} isOpen onClose={closeModal} />}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
