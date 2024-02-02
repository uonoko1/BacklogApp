import React, { useEffect } from 'react'
import "./Sidebar.css"
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import CottageIcon from '@mui/icons-material/Cottage';
import ChatIcon from '@mui/icons-material/Chat';
import ConstructionIcon from '@mui/icons-material/Construction';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePath } from '../../state/PathContext';

export default function Sidebar() {
    const { path, setPath } = usePath();

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const currentPath = location.pathname.split('/')[1];
        if (currentPath !== 'tasks' && currentPath !== 'users' && currentPath !== 'board') {
            setPath('projects');
            return;
        }
        setPath(currentPath);
    }, [location]);

    return (
        <div className='Sidebar'>
            <div className='SidebarTrigger'>
                <MenuIcon className='SidebarTriggerIcon' />
            </div>
            <ul className="SidebarMenu" onClick={(e) => e.stopPropagation()}>
                <li className={`${path === 'projects' && 'selected'}`} onClick={() => navigate('/')}>
                    <CottageIcon />
                    <p>プロジェクト</p>
                </li>
                <li className={`${path === 'tasks' && 'selected'}`} onClick={() => navigate('/tasks')}>
                    <ConstructionIcon />
                    <p>課題</p>
                </li>
                <li className={`${path === 'users' && 'selected'}`} onClick={() => navigate('/users')}>
                    <PersonIcon />
                    <p>ユーザー</p>
                </li>
                <li className={`${path === 'board' && 'selected'}`} onClick={() => navigate('/board')}>
                    <ChatIcon />
                    <p>掲示板</p>
                </li>
            </ul>
        </div>
    )
}
