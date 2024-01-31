import React, { useEffect, useState } from 'react'
import "./Center.css"
import SearchIcon from '@mui/icons-material/Search';
import { usePath } from '../../state/PathContext';
import Tasks from '../../pages/tasks/Tasks';
import { useAuth } from '../../state/AuthContext';
import axios from 'axios';

export default function Center() {
    const { path } = usePath();
    const { user } = useAuth();
    const [searchInput, setSearchInput] = useState('');
    const [fullSpaceUrl, setFullSpaceUrl] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);

    const redirectToBacklogAuth = async () => {
        if (!fullSpaceUrl) return;
        if (!user) {
            setErrorMessage('先にユーザー登録をしてください。');
            return;
        }
        const CLIENT_ID = process.env.REACT_APP_BACKLOG_CLIENTID;
        const REDIRECT_URI = process.env.REACT_APP_BACKLOG_REDIRECT_URI;

        const domain = fullSpaceUrl.replace(/^\w+:|^\/\//, '');
        const combinedState = `${user.state}|${domain}`;
        window.location.href = `https://${domain}/OAuth2AccessRequest.action?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&state=${encodeURIComponent(combinedState)}`;
    }

    useEffect(() => {
        const fetchBacklogData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/backlog/${path}`);
                if (path === 'projects') {
                    console.log("projects:", projects);
                    setProjects(response.data);
                } else if (path === 'tasks') {
                    console.log("tasks:", tasks);
                    setTasks(response.data);
                }
            } catch (err) {
                console.log("err:", err)
            }
        }
        if ((path === 'projects' || path === 'tasks') && (user && user.backlog_oauth)) fetchBacklogData();
    }, [path, user])

    const backlogOAuth = (!user?.backlog_oauth) && (path === 'projects' || path === 'tasks')

    return (
        <div className={`Center ${backlogOAuth ? 'AuthCenter' : ''}`}>
            {backlogOAuth ?
                <>
                    <div className="BacklogOAuthDialog">
                        <h2>この機能はBacklog認証が必要です。</h2>
                        <div className="Spacefield">
                            <label htmlFor="fullSpaceUrl">スペースURL</label>
                            <input id='fullSpaceUrl' type="text" value={fullSpaceUrl} onChange={(e) => setFullSpaceUrl(e.target.value)} placeholder="example.backlog.jp" />
                            {errorMessage && <p>{errorMessage}</p>}
                        </div>
                        <div className="BacklogOAuthButtonField">
                            <button type='button' onClick={redirectToBacklogAuth}>
                                <img src={`${process.env.REACT_APP_URL}/assets/icon_backlog.svg`} alt="backlogIcon" />
                                <p>Backlog</p>
                            </button>
                        </div>
                    </div>
                </>
                :
                <>
                    <div className='SearchBox'>
                        <SearchIcon />
                        <input type='text' value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className='SearchBoxInput' />
                    </div>
                    {(path === 'projects' || path === 'tasks') && <Tasks />}
                </>
            }
        </div>
    )
}
