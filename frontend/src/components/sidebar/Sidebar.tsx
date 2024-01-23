import React, { useEffect } from 'react'
import "./Sidebar.css"
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupsIcon from '@mui/icons-material/Groups';
import ConstructionIcon from '@mui/icons-material/Construction';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePath } from '../../state/PathContext';

export default function Sidebar() {
    const { path, setPath } = usePath();

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const currentPath = location.pathname.split('/')[1];
        if (currentPath !== 'users' && currentPath !== 'tasks' && currentPath !== 'teams') {
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
                    <ConstructionIcon />
                    <p>プロジェクト</p>
                </li>
                <li className={`${path === 'users' && 'selected'}`} onClick={() => navigate('/users')}>
                    <PersonIcon />
                    <p>ユーザー</p>
                </li>
                <li className={`${path === 'teams' && 'selected'}`} onClick={() => navigate('/teams')}>
                    <GroupsIcon />
                    <p>チーム</p>
                </li>
                <li className={`${path === 'tasks' && 'selected'}`} onClick={() => navigate('/tasks')}>
                    <AssignmentIcon />
                    <p>課題</p>
                </li>
            </ul>
        </div>
    )
}
