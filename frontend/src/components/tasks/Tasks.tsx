import React, { useState, useEffect } from 'react'
import './Tasks.css'
import { FavoriteTask, Task } from '../../types/Backlog'
import axios from 'axios';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { useNavigate, useParams } from 'react-router-dom';
import DetailTask from '../detailTask/DetailTask';

interface TasksProps {
    tasks: Task[];
    favoriteTasks: Task[];
    sortedByDate: (a: Task, b: Task) => number;
    checkedStates: { [key: number]: boolean };
    setCheckedStates: React.Dispatch<React.SetStateAction<{ [key: number]: boolean }>>;
    favoriteList: FavoriteTask[];
    setFavoriteList: React.Dispatch<React.SetStateAction<FavoriteTask[]>>;
}

export default function Tasks({ tasks, favoriteTasks, sortedByDate, checkedStates, setCheckedStates, favoriteList, setFavoriteList }: TasksProps) {
    const navigate = useNavigate();
    const { taskId } = useParams();
    const [selectTask, setSelectTask] = useState<Task>();

    const handleCheckBox = async (id: number) => {
        const newState = !checkedStates[id];
        setCheckedStates({
            ...checkedStates,
            [id]: newState
        });

        try {
            if (newState) {
                await axios.post(`${process.env.REACT_APP_API_URL}/api/fav/task/${id}`);
                const newFavoriteItem = { task_id: id, created_at: new Date().toISOString() };
                setFavoriteList([...(favoriteList || []), newFavoriteItem]);
            } else {
                await axios.delete(`${process.env.REACT_APP_API_URL}/api/fav/task/${id}`);
                const updatedFavoriteList = (favoriteList || []).filter(favTask => favTask.task_id !== id);
                setFavoriteList(updatedFavoriteList);
            }
        } catch (err) {
            setCheckedStates({
                ...checkedStates,
                [id]: !newState
            });
            console.log("err:", err);
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${date.getMonth() + 1}月${date.getDate()}日`;
    };

    const sortedTasks = [...tasks].sort(sortedByDate);
    const sortedFavoriteTasks = [...favoriteTasks].sort(sortedByDate);

    const handleSelectTask = (task: Task) => {
        setSelectTask(task);
        navigate(`tasks/${task.id}`);
    }

    useEffect(() => {
        if (taskId && !selectTask) {
            const fetchTaskDetail = async () => {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/backlog/task/${taskId}`);
                    setSelectTask(response.data);
                } catch (err) {
                    console.log("タスクの詳細データの取得に失敗しました。", err);
                }
            };

            fetchTaskDetail();
        }
    }, [taskId])

    return (
        <>
            {selectTask ?
                <DetailTask task={selectTask} />
                :
                <div className='tasksContent'>
                    <div className='Favorite'>
                        <h4>お気に入り</h4>
                        <div className='taskItem'>
                            <p className='taskId'>課題ID</p>
                            <p className='taskKey'>キー</p>
                            <p className='taskName'>件名</p>
                            <p className='taskPriority'>優先度</p>
                            <p className='taskDueDate'>期限日</p>
                        </div>
                        <ul>
                            {sortedFavoriteTasks.map((task) => {
                                return (
                                    <li key={task.id} onClick={() => handleSelectTask(task)}>
                                        <HighlightOffIcon className='deleteIcon' onClick={() => handleCheckBox(task.id)} />
                                        <p className='taskId'>{task.id}</p>
                                        <p className='taskKey'>{task.issueKey}</p>
                                        <p className='taskName'>{task.summary}</p>
                                        <p className='taskPriority'>{task.priority.name}</p>
                                        <p className='taskDueDate'>{formatDate(task.dueDate)}</p>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                    <div className='SearchResult'>
                        <h4>検索結果(新しい順)</h4>
                        <div className='taskItem'>
                            <p className='taskId'>課題ID</p>
                            <p className='taskKey'>キー</p>
                            <p className='taskName'>件名</p>
                            <p className='taskPriority'>優先度</p>
                            <p className='taskDueDate'>期限日</p>
                        </div>
                        <ul>
                            {sortedTasks.map((task) => {
                                return (
                                    <li key={task.id} onClick={() => handleSelectTask(task)}>
                                        <input
                                            type="checkbox"
                                            checked={!!checkedStates[task.id]}
                                            onChange={() => handleCheckBox(task.id)}
                                        />
                                        <p className='taskId'>{task.id}</p>
                                        <p className='taskKey'>{task.issueKey}</p>
                                        <p className='taskName'>{task.summary}</p>
                                        <p className='taskPriority'>{task.priority.name}</p>
                                        <p className='taskDueDate'>{formatDate(task.dueDate)}</p>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                </div>
            }
        </>
    )
}
