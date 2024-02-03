import React from 'react'
import './DetailTask.css'
import { Task } from '../../types/Backlog';
import Description from '../../utils/description/Description';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

interface DetailTaskProps {
    task: Task;
    handleBack: () => void;
}

export default function DetailTask({ task, handleBack }: DetailTaskProps) {
    const createdDate = new Date(task.created);
    const formattedDate = `${createdDate.getFullYear()}/${createdDate.getMonth() + 1}/${createdDate.getDate()} ${createdDate.getHours()}:${createdDate.getMinutes()}:${createdDate.getSeconds()}`;

    return (
        <div className='DetailTaskContent'>
            <div className="DetailTaskTitle">
                <ArrowBackIosNewIcon className='backIcon' onClick={handleBack} />
                <h2>{task.summary}</h2>
            </div>
            <div className="taskDialog">
                <div className="taskTop">
                    <p className='taskCreatedUsername'>{task.createdUser.name}</p>
                    <p className='taskCreatedDate'>登録日 {formattedDate}</p>
                    <Description description={task.description} />
                    <div className="taskProperties">
                        <div className="TaskPriority">
                            <div className='TaskPriorityLabel'>優先度</div>
                            <div className='TaskPriorityValue'>{task.priority.name}</div>
                        </div>
                        <div className="TaskAssigner">
                            <div className='TaskAssignerLable'>担当者</div>
                            <div className='TaskAssignerValue'>{task.assignee.name}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
