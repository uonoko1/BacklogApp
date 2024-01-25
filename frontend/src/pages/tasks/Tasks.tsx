import React, { useEffect, useState } from 'react'
import "./Tasks.css"
import axios from 'axios';

export default function Tasks() {
    interface Task {
        id: number;
        name: string;
    }

    const [tasks, setTasks] = useState<Task[]>([]);
    const [favTasks, setFavTasks] = useState<Task[]>([]);

    useEffect(() => {
        const fetchTasks = async () => {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/tasks`);
            setFavTasks(response.data.favTasks);
            setTasks(response.data.tasks);
        }
        // fetchTasks();
    }, [])

    return (
        <>
            <div className='Favorite'>
                <h4>お気に入り</h4>
                <ul className='FavoriteList'>
                    {tasks.map((task) => {
                        return (
                            <li key={task.id}>{task.name}</li>
                        )
                    })}
                </ul>
            </div>
            <div className='SearchResult'>
                <h4>検索結果(新しい順)</h4>
                <ul className='SearchResultList'>
                    {favTasks.map((favTask) => {
                        return (
                            <li key={favTask.id}>{favTask.name}</li>
                        )
                    })}
                </ul>
            </div>
        </>
    )
}
