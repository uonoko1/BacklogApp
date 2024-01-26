import React from "react";
import "./Topbar.css";
import { useModal } from "../../state/ModalContext";
import { useAuth } from "../../state/AuthContext";

export default function Topbar() {
    const { setShowLogin } = useModal();
    const { user } = useAuth();
    return (
        <header className='header'>
            <h3>BacklogApp</h3>
            {user ?
                <p>{user.username}</p>
                :
                <button type='button' onClick={() => setShowLogin(true)}>ログイン</button>
            }
        </header>
    )
}
