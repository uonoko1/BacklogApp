import React, { useEffect, useState } from 'react'
import './DetailTask.css'
import { Task } from '../../types/Backlog';
import Description from '../../utils/Description';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

interface DetailTaskProps {
    tasks: Task[];
}

export default function DetailTask({ tasks }: DetailTaskProps) {
    const [selectTask, setSelectTask] = useState<Task | null>(null);
    const taskId = useParams().taskId;
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [comments, setComments] = useState<Comment[] | null>(null);

    useEffect(() => {
        const fetchTaskDetail = async () => {
            try {
                const taskNumId = Number(taskId)
                const findTask = tasks.find((task) => task.id === taskNumId)
                setSelectTask(findTask !== undefined ? findTask : null);
            } catch (err) {
                console.log("タスクの詳細データの取得に失敗しました。", err);
            }
        };
        if (taskId && tasks) fetchTaskDetail();
    }, [taskId, tasks])

    useEffect(() => {
        const fetchTaskComments = async () => {
            if (!selectTask) return;
            try {
                setIsLoading(true);
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/backlog/comments/${selectTask.id}`);
                setComments(response.data);
                console.log("コメント一覧:", response.data)
            } catch (err) {
                console.log("err:", err);
            } finally {
                setIsLoading(false);
            }
        }

        if (selectTask) fetchTaskComments();
    }, [selectTask])

    let createdDate
    let formattedDate

    if (selectTask) {
        createdDate = new Date(selectTask.created);
        formattedDate = `${createdDate.getFullYear()}/${createdDate.getMonth() + 1}/${createdDate.getDate()} ${createdDate.getHours()}:${createdDate.getMinutes()}:${createdDate.getSeconds()}`;
    }
    if (selectTask) {
        return (
            <div className='DetailTaskContent'>
                <div className="DetailTaskTitle">
                    <ArrowBackIosNewIcon className='backIcon' onClick={() => navigate('/tasks')} />
                    <h2>{selectTask.summary}</h2>
                </div>
                <div className="taskDialog">
                    <div className="taskTop">
                        <p className='taskCreatedUsername'>{selectTask.createdUser.name}</p>
                        <p className='taskCreatedDate'>登録日 {formattedDate}</p>
                        <div className="taskDescription">
                            <Description description={selectTask.description} />
                        </div>
                        <div className="taskProperties">
                            <div className="TaskPriority">
                                <div className='TaskPriorityLabel'>優先度</div>
                                <div className='TaskPriorityValue'>{selectTask.priority.name}</div>
                            </div>
                            <div className="TaskAssigner">
                                <div className='TaskAssignerLable'>担当者</div>
                                <div className='TaskAssignerValue'>{selectTask.assignee.name}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="taskComments">

                </div>
            </div>
        )
    } else {
        return null;
    }
}
