import React, { useState } from 'react'
import "./Center.css"
import SearchIcon from '@mui/icons-material/Search';
import ListItem from '../listItem/ListItem';

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
                    <ListItem />
                </ul>
            </div>
            <div className='SearchResult'>
                <h4>検索結果(新しい順)</h4>
                <ul className='SearchResultList'>
                    <ListItem />
                </ul>
            </div>
        </div>
    )
}
