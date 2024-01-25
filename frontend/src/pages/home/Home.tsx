import React from 'react'
import "./Home.css"
import Topbar from '../../components/topbar/Topbar'
import Sidebar from '../../components/sidebar/Sidebar'
import Center from '../../components/center/Center'
import { useModal } from '../../state/ModalContext'
import ModalLogin from '../../components/modalLogin/ModalLogin'

export default function Home() {
    const { showLogin } = useModal();
    return (
        <div className='Home'>
            <Topbar />
            <div className="bottom">
                <Sidebar />
                <Center />
            </div>
            {showLogin && <ModalLogin />}
        </div>
    )
}
