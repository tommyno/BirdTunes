import React, { useEffect, useRef, useState } from "react";
import styles from "./Modal.module.scss";
import { classNames } from "utils/classNames";
import useBodyFreeze from "utils/useBodyFreeze";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useBodyFreeze(isOpen);

  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // Focus trap logic
  useEffect(() => {
    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const focusableElements = modalRef.current?.querySelectorAll(
        'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>;

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        // Shift + Tab: Move focus to the last element if at the first
        lastElement.focus();
        event.preventDefault();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        // Tab: Move focus to the first element if at the last
        firstElement.focus();
        event.preventDefault();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleTab);
    }

    return () => {
      document.removeEventListener("keydown", handleTab);
    };
  }, [isOpen]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen && !isVisible) return null;

  const overlayClass = classNames(
    styles.overlay,
    isVisible && styles.modalVisible
  );

  return (
    <div
      className={overlayClass}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.wrap} ref={modalRef} tabIndex={-1}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Lukk vindu"
        >
          <img src="/icons/close.svg" alt="Lukk modal" />
        </button>

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
};
