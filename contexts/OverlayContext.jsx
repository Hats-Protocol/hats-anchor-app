import React, { createContext, useState, useContext, useMemo } from 'react';

const defaults = {
  createTreeForm: false,
  wearerForm: false,
  createHatForm: false,
};

export const OverlayContext = createContext({});

export const OverlayContextProvider = ({ children }) => {
  const [modals, setModals] = useState(defaults);
  const [commandPallet, setCommandPallet] = useState(false);

  const showModal = (m) => {
    // This allows to show only one modal at a time.
    // In addition, this reset any true value for other modals.
    setModals({ ...defaults, ...m });
  };

  const closeModals = () => {
    setModals(defaults);
  };

  const returnValue = useMemo(
    () => ({
      modals,
      setModals: showModal,
      closeModals,
      commandPallet,
      setCommandPallet,
    }),
    [modals, commandPallet],
  );

  return (
    <OverlayContext.Provider value={returnValue}>
      {children}
    </OverlayContext.Provider>
  );
};

export const useOverlay = () => useContext(OverlayContext);
