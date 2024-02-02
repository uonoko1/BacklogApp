import { createContext, useContext, useState, Dispatch, SetStateAction } from "react";

interface PathContextType {
    path: string;
    setPath: Dispatch<SetStateAction<string>>;
    searchInput: string;
    setSearchInput: Dispatch<SetStateAction<string>>;
}

const PathContext = createContext<PathContextType>({
    path: '',
    setPath: () => { },
    searchInput: '',
    setSearchInput: () => { }
});

export function usePath() {
    return useContext(PathContext);
}

export function PathProvider({ children }: { children: React.ReactNode }) {
    const [path, setPath] = useState('');
    const [searchInput, setSearchInput] = useState('');

    return (
        <PathContext.Provider value={{ path, setPath, searchInput, setSearchInput }}>
            {children}
        </PathContext.Provider>
    );
}
