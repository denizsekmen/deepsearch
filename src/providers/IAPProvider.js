import React, { useState } from "react";
import useIAP from "../hooks/useIAP";
import { IAPContext } from "../context/IAPContext";
import SubscriptionModal from "../components/modal/subscription/SubscriptionModal";
export default function IAPProvider({
  children,
  isPremium,
  setIsPremium,
  products,
}) {
  const iapState = useIAP(isPremium, setIsPremium);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [defaultPackage, setDefaultPackage] = useState(null);

  const showSubscriptionModal = (packageType = null) => {
    setDefaultPackage(packageType);
    setIsModalOpen(true);
  };

  return (
    <IAPContext.Provider
      value={{
        ...iapState,
        products,
        isPremium,
        showSubscriptionModal,
        closeSubscriptionModal: () => setIsModalOpen(false),
        isModalOpen,
      }}
    >
      {children}
      <SubscriptionModal 
        isOpen={isModalOpen} 
        setIsOpen={setIsModalOpen}
        defaultPackage={defaultPackage}
      />
    </IAPContext.Provider>
  );
}
