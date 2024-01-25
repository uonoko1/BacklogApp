import { createContext, useContext, useState, Dispatch, SetStateAction } from "react";

interface PathContextType {
    path: string;
    setPath: Dispatch<SetStateAction<string>>;
}

const PathContext = createContext<PathContextType>({
    path: '',
    setPath: () => { }
});

export function usePath() {
    return useContext(PathContext);
}

export function PathProvider({ children }: { children: React.ReactNode }) {
    const [path, setPath] = useState('');

    return (
        <PathContext.Provider value={{ path, setPath }}>
            {children}
        </PathContext.Provider>
    );
}
