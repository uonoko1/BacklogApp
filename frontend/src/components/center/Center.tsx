import React, { useEffect, useState } from 'react'
import "./Center.css"
import SearchIcon from '@mui/icons-material/Search';
import { usePath } from '../../state/PathContext';
import { useAuth } from '../../state/AuthContext';
import axios from 'axios';
import Tasks from '../tasks/Tasks';
import Projects from '../projects/Projects';
import { FavoriteProject, FavoriteTask, Project, Task } from '../../types/Backlog';

export default function Center() {
    const { path } = usePath();
    const { user } = useAuth();
    const [searchInput, setSearchInput] = useState('');
    const [fullSpaceUrl, setFullSpaceUrl] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [projects, setProjects] = useState<Project[]>([]);
    const [favoriteProjectList, setFavoriteProjectList] = useState<FavoriteProject[]>([]);
    const [favoriteProjects, setFavoriteProjects] = useState<Project[]>([]);
    const [checkedProjectStates, setCheckedProjectStates] = useState<{ [key: number]: boolean }>({});
    const [tasks, setTasks] = useState<Task[]>([]);
    const [favoriteTaskList, setFavoriteTaskList] = useState<FavoriteTask[]>([]);
    const [favoriteTasks, setFavoriteTasks] = useState<Task[]>([]);
    const [checkedTaskStates, setCheckedTaskStates] = useState<{ [key: number]: boolean }>({});

    const redirectToBacklogAuth = async () => {
        if (!fullSpaceUrl) return;
        if (!user) {
            setErrorMessage('先にログインをしてください。');
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
                const endpoint = path === 'projects' ? 'projects' : 'tasks';
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/backlog/${endpoint}`);
                const favResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/fav/${endpoint}`)
                if (path === 'projects') {
                    setProjects(response.data);
                    setFavoriteProjectList(favResponse.data)
                } else if (path === 'tasks') {
                    setTasks(response.data);
                    setFavoriteTaskList(favResponse.data)
                }
            } catch (err) {
                console.log("err:", err);
            }
        };

        if (!user?.backlog_oauth) return;

        if ((path === 'projects' && projects.length === 0) || (path === 'tasks' && tasks.length === 0)) {
            fetchBacklogData();
        }
    }, [path, user]);

    useEffect(() => {
        if (!projects || projects.length === 0 || !favoriteProjectList) return;

        const favoriteProjectsDetails: Project[] = projects.filter(project =>
            Array.isArray(favoriteProjectList) && favoriteProjectList.some(favProject => favProject.project_id === project.id)
        );
        setFavoriteProjects(favoriteProjectsDetails);
    }, [projects, favoriteProjectList]);

    useEffect(() => {
        if (!tasks || tasks.length === 0 || !favoriteTaskList) return;


        const favoriteTasksDetails: Task[] = tasks.filter(task =>
            Array.isArray(favoriteTaskList) && favoriteTaskList.some(favTask => favTask.task_id === task.id)
        );
        setFavoriteTasks(favoriteTasksDetails);
    }, [tasks, favoriteTaskList]);

    useEffect(() => {
        if (!projects || projects.length === 0 || !favoriteProjects || favoriteProjects.length === 0) return;
        const updatedCheckedStates = projects.reduce((acc, project) => {
            const isFavorite = favoriteProjects.some(favProject => favProject.id === project.id);
            acc[project.id] = isFavorite;
            return acc;
        }, {} as { [key: number]: boolean });

        setCheckedProjectStates(updatedCheckedStates);
    }, [projects, favoriteProjects]);

    useEffect(() => {
        if (!tasks || tasks.length === 0 || !favoriteTasks || favoriteTasks.length === 0) return;
        const updatedCheckedStates = tasks.reduce((acc, task) => {
            const isTask = favoriteTasks.some(favTask => favTask.id === task.id);
            acc[task.id] = isTask;
            return acc;
        }, {} as { [key: number]: boolean });

        setCheckedTaskStates(updatedCheckedStates);
    }, [tasks, favoriteTasks]);

    function sortByLatestDate(a: Task, b: Task) {
        const dateA = new Date(a.updated || a.created);
        const dateB = new Date(b.updated || b.created);
        return dateB.getTime() - dateA.getTime();
    }

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
                    {path === 'projects' && (
                        <Projects
                            projects={projects}
                            favoriteProjects={favoriteProjects}
                            checkedStates={checkedProjectStates}
                            setCheckedStates={setCheckedProjectStates}
                            favoriteList={favoriteProjectList}
                            setFavoriteList={setFavoriteProjectList}
                        />
                    )}
                    {path === 'tasks' && (
                        <Tasks
                            tasks={tasks}
                            favoriteTasks={favoriteTasks}
                            sortedByDate={sortByLatestDate}
                            checkedStates={checkedTaskStates}
                            setCheckedStates={setCheckedTaskStates}
                            favoriteList={favoriteTaskList}
                            setFavoriteList={setFavoriteTaskList}
                        />
                    )}
                </>
            }
        </div>
    )
}
