import axios from "axios";
import React, { createContext, useContext, useState, Dispatch, SetStateAction, useEffect } from "react";

interface UserType {
    userId: string;
    username: string;
    email: string;
    desc: string;
    state: string,
    backlog_oauth: boolean
}

interface AuthContextType {
    user: UserType | null;
    setUser: Dispatch<SetStateAction<UserType | null>>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    setUser: () => { }
});

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserType | null>(null);
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/user`);
                setUser(response.data);
            } catch (err) {
                console.log(err)
            }
        }
        fetchUser();
    }, [])

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}
