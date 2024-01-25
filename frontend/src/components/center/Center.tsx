import React, { useState } from 'react'
import "./Center.css"
import SearchIcon from '@mui/icons-material/Search';
import { usePath } from '../../state/PathContext';
import Tasks from '../../pages/tasks/Tasks';

export default function Center() {
    const { path } = usePath();
    const [searchInput, setSearchInput] = useState('');

    return (
        <div className='Center'>
            <div className='SearchBox'>
                <SearchIcon />
                <input type='text' value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className='SearchBoxInput' />
            </div>
            {path === 'tasks' && <Tasks />}
        </div>
    )
}
