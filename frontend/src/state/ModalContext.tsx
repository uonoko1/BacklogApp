import React, { createContext, useContext, useState, Dispatch, SetStateAction } from "react";

interface ModalContextType {
    showLogin: boolean;
    setShowLogin: Dispatch<SetStateAction<boolean>>;
}

const ModalContext = createContext<ModalContextType>({
    showLogin: false,
    setShowLogin: () => { },
});

export function useModal() {
    return useContext(ModalContext);
}

export function ModalProvider({ children }: { children: React.ReactNode }) {
    const [showLogin, setShowLogin] = useState(false);

    return (
        <ModalContext.Provider value={{ showLogin, setShowLogin }}>
            {children}
        </ModalContext.Provider>
    )
}
