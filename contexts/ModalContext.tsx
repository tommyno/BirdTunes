import React, { createContext, useContext, useState } from "react";
import { BirdModal } from "components/BirdModal/BirdModal";

type ModalType = "bird" | "settings" | "info";

type ModalState = {
  type: ModalType | null;
  props: any;
};

type ModalContextType = {
  openModal: (type: ModalType, props: any) => void;
  closeModal: () => void;
  modalState: ModalState;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modalState, setModalState] = useState<ModalState>({
    type: null,
    props: null,
  });

  const openModal = (type: ModalType, props: any) => {
    setModalState({ type, props });
  };

  const closeModal = () => {
    setModalState({ type: null, props: null });
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal, modalState }}>
      {children}
      {modalState.type === "bird" && (
        <BirdModal
          bird={modalState.props}
          isOpen={!!modalState.props}
          onClose={closeModal}
        />
      )}
    </ModalContext.Provider>
  );
}

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
