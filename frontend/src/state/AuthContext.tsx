import axios from 'axios';
import React, { createContext, useContext, useState, Dispatch, SetStateAction, useEffect } from 'react';
import { UserType } from '../types/User';

interface AuthContextType {
    user: UserType | null;
    setUser: Dispatch<SetStateAction<UserType | null>>;
    backlogUsername: string;
    setBacklogUsername: Dispatch<SetStateAction<string>>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    setUser: () => { },
    backlogUsername: '',
    setBacklogUsername: () => { },
});

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserType | null>(null);
    const [backlogUsername, setBacklogUsername] = useState('');
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/user`);
                setUser(response.data);
            } catch {
            }
        }
        fetchUser();
    }, [])

    useEffect(() => {
        const fetchBacklogUsername = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/backlog/myself`);
                setBacklogUsername(response.data);
            } catch (err) {
                console.log("err:", err);
            }
        }

        if (user?.backlog_oauth) fetchBacklogUsername();
    }, [user])

    return (
        <AuthContext.Provider value={{ user, setUser, backlogUsername, setBacklogUsername }}>
            {children}
        </AuthContext.Provider>
    );
}
