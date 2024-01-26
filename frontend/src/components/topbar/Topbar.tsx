import React, { useState } from "react";
import "./Topbar.css";
import { useModal } from "../../state/ModalContext";
import { useAuth } from "../../state/AuthContext";
import axios from "axios";
import { TailSpin } from "react-loader-spinner";

export default function Topbar() {
    const { setShowLogin } = useModal();
    const { user, setUser } = useAuth();
    const [userMenu, setUserMenu] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const logout = async () => {
        try {
            setIsLoading(true);
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/auth/logout`);
            setUser(null);
            setUserMenu(false);
        } catch (err) {
            console.log("err:", err);
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <>
            <header className='header'>
                <h3>BacklogApp</h3>
                {user ?
                    <button type='button' onClick={() => setUserMenu(true)}>{user.username}</button>
                    :
                    <button type='button' onClick={() => setShowLogin(true)}>ログイン</button>
                }
            </header>
            {userMenu && user &&
                <>
                    <div className='UserMenuOverlay' onClick={() => setUserMenu(false)}>
                        <ul className='UserMenuDialog' onClick={(e) => e.stopPropagation()}>
                            <li><p className='UserMenuGreet'>{user.username}さん、こんにちは</p></li>
                            <li>
                                <button type='button'>個人設定</button>
                            </li>
                            <li>
                                {isLoading ?
                                    <TailSpin color='#00BFFF' height={30} width={30} />
                                    :
                                    <button type='button' onClick={logout}>ログアウト</button>
                                }
                            </li>
                        </ul>
                    </div>
                </>
            }
        </>
    )
}
