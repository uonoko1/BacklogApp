import React, { useState } from 'react'
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
    const [spaceInput, setSpaceInput] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const redirectToBacklogAuth = async () => {
        if (!spaceInput) return;
        if (!user) {
            setErrorMessage('先にユーザー登録をしてください。');
            return;
        }
        const CLIENT_ID = process.env.REACT_APP_BACKLOG_CLIENTID;
        const REDIRECT_URI = process.env.REACT_APP_BACKLOG_REDIRECT_URI;

        window.location.href = `https://${spaceInput}.backlog.jp/OAuth2AccessRequest.action?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}`;
    }

    return (
        <div className={`Center ${(!user || !user.backlog) && (path === 'projects' || path === 'tasks') ? 'AuthCenter' : ''}`}>
            {path === 'projects' || path === 'tasks' ?
                <>
                    <div className="BacklogOAuthDialog">
                        <h2>この機能はBacklog認証が必要です。</h2>
                        <div className="Spacefield">
                            <label htmlFor="space">スペース名</label>
                            <input id='space' type="text" value={spaceInput} onChange={(e) => setSpaceInput(e.target.value)} />
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
                    {path === 'tasks' && <Tasks />}
                </>
            }
        </div>
    )
}
