import React, { createContext, useContext, useState, Dispatch, SetStateAction } from "react";

interface ModalContextType {
    showLogin: boolean;
    setShowLogin: Dispatch<SetStateAction<boolean>>;
    showRegister: boolean;
    setShowRegister: Dispatch<SetStateAction<boolean>>;
}

const ModalContext = createContext<ModalContextType>({
    showLogin: false,
    setShowLogin: () => { },
    showRegister: false,
    setShowRegister: () => { }
});

export function useModal() {
    return useContext(ModalContext);
}

export function ModalProvider({ children }: { children: React.ReactNode }) {
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    return (
        <ModalContext.Provider value={{ showLogin, setShowLogin, showRegister, setShowRegister }}>
            {children}
        </ModalContext.Provider>
    )
}
