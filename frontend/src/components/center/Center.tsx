import React, { useState } from 'react'
import "./Center.css"
import { Route, Routes } from 'react-router-dom';
import Projects from '../../pages/projects/Projects';
import Tasks from '../../pages/tasks/Tasks';
import Teams from '../../pages/teams/Teams';
import Users from '../../pages/users/Users';
import SearchIcon from '@mui/icons-material/Search';

export default function Center() {
    const [searchInput, setSearchInput] = useState('');
    return (
        <div className='Center'>
            <div className='SearchBox'>
                <SearchIcon />
                <input type='text' value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className='SearchBoxInput' />
            </div>
            <div className='Favorite'>
                <h4>お気に入り</h4>
                <ul className='FavoriteList'>
                    <li className='FavoriteListItem'></li>
                </ul>
            </div>
            <div className='SearchResult'>
                <h4>検索結果(新しい順)</h4>
                <ul className='SearchResultList'>
                    <li className='SearchResultListItem'></li>
                </ul>
            </div>
            <Routes>
                <Route path="/tasks/*" element={<Tasks />} />
                <Route path="/teams/*" element={<Teams />} />
                <Route path="/users/*" element={<Users />} />
                <Route path="/*" element={<Projects />} />
            </Routes>
        </div>
    )
}
