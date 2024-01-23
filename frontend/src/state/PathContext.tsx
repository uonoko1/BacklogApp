import { createContext, useContext, useState, Dispatch, SetStateAction } from "react";

interface PathContextType {
    path: string;
    setPath: Dispatch<SetStateAction<string>>;
}

// 正しい型を持つ初期値を指定
const PathContext = createContext<PathContextType>({
    path: '',
    setPath: () => { } // ここはダミーの関数
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
