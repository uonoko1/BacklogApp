import React from "react";
import "./Topbar.css";
import { useModal } from "../../state/ModalContext";

export default function Topbar() {
    const { setShowLogin } = useModal();
    return (
        <header className='header'>
            <h3>BacklogApp</h3>
            <button type='button' onClick={() => setShowLogin(true)}>ログイン</button>
        </header>
    )
}
