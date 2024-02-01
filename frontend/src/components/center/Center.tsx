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
    // const initialProjects: Project[] = [
    //     {
    //         id: 196134,
    //         projectKey: "SAKAI",
    //         name: "酒井 大地",
    //         chartEnabled: true,
    //         useResolvedForChart: false,
    //         subtaskingEnabled: true,
    //         projectLeaderCanEditProjectLeader: false,
    //         useWiki: true,
    //         useFileSharing: true,
    //         useWikiTreeView: true,
    //         useSubversion: false,
    //         useGit: true,
    //         useOriginalImageSizeAtWiki: false,
    //         textFormattingRule: "markdown",
    //         archived: false,
    //         displayOrder: 2147483646,
    //         useDevAttributes: true,
    //     },
    //     {
    //         id: 196135,
    //         projectKey: "DEVOPS",
    //         name: "開発運用チーム",
    //         chartEnabled: false,
    //         useResolvedForChart: true,
    //         subtaskingEnabled: false,
    //         projectLeaderCanEditProjectLeader: true,
    //         useWiki: false,
    //         useFileSharing: false,
    //         useWikiTreeView: false,
    //         useSubversion: true,
    //         useGit: false,
    //         useOriginalImageSizeAtWiki: true,
    //         textFormattingRule: "backlog",
    //         archived: true,
    //         displayOrder: 2147483645,
    //         useDevAttributes: false,
    //     },
    //     {
    //         id: 196136,
    //         projectKey: "DESIGN",
    //         name: "デザインチーム",
    //         chartEnabled: true,
    //         useResolvedForChart: false,
    //         subtaskingEnabled: true,
    //         projectLeaderCanEditProjectLeader: true,
    //         useWiki: true,
    //         useFileSharing: true,
    //         useWikiTreeView: true,
    //         useSubversion: false,
    //         useGit: true,
    //         useOriginalImageSizeAtWiki: false,
    //         textFormattingRule: "markdown",
    //         archived: false,
    //         displayOrder: 2147483644,
    //         useDevAttributes: true,
    //     },
    //     {
    //         id: 196137,
    //         projectKey: "HR",
    //         name: "人事部",
    //         chartEnabled: false,
    //         useResolvedForChart: true,
    //         subtaskingEnabled: false,
    //         projectLeaderCanEditProjectLeader: false,
    //         useWiki: false,
    //         useFileSharing: false,
    //         useWikiTreeView: false,
    //         useSubversion: true,
    //         useGit: false,
    //         useOriginalImageSizeAtWiki: true,
    //         textFormattingRule: "backlog",
    //         archived: true,
    //         displayOrder: 2147483643,
    //         useDevAttributes: false,
    //     },
    //     {
    //         id: 196138,
    //         projectKey: "MARKETING",
    //         name: "マーケティングチーム",
    //         chartEnabled: true,
    //         useResolvedForChart: true,
    //         subtaskingEnabled: true,
    //         projectLeaderCanEditProjectLeader: true,
    //         useWiki: true,
    //         useFileSharing: true,
    //         useWikiTreeView: false,
    //         useSubversion: false,
    //         useGit: false,
    //         useOriginalImageSizeAtWiki: true,
    //         textFormattingRule: "backlog",
    //         archived: false,
    //         displayOrder: 2147483642,
    //         useDevAttributes: false,
    //     },
    //     {
    //         id: 196139,
    //         projectKey: "SALES",
    //         name: "営業部",
    //         chartEnabled: false,
    //         useResolvedForChart: false,
    //         subtaskingEnabled: false,
    //         projectLeaderCanEditProjectLeader: false,
    //         useWiki: false,
    //         useFileSharing: false,
    //         useWikiTreeView: false,
    //         useSubversion: true,
    //         useGit: true,
    //         useOriginalImageSizeAtWiki: false,
    //         textFormattingRule: "markdown",
    //         archived: true,
    //         displayOrder: 2147483641,
    //         useDevAttributes: true,
    //     }
    // ];

    // const initialTasks: Task[] = [
    //     {
    //         id: 39086535,
    //         projectId: 196134,
    //         issueKey: "SAKAI-1",
    //         keyId: 1,
    //         issueType: {
    //             id: 1053516,
    //             projectId: 196134,
    //             name: 'Task',
    //             color: '#7ea800',
    //             displayOrder: 0,
    //         },
    //         summary: "Backlogの課題",
    //         description: "ログインいただき、ありがとうございます。...",
    //         resolution: null,
    //         priority: {
    //             id: 3,
    //             name: "中",
    //         },
    //         status: {
    //             id: 1,
    //             projectId: 196134,
    //             name: '未対応',
    //             color: '#ed8077',
    //             displayOrder: 1000,
    //         },
    //         assignee: {
    //             id: 570826,
    //             userId: '*1NhzVopKiQ',
    //             name: '酒井大地',
    //             roleType: 2,
    //             lang: 'ja',
    //             mailAddress: '',
    //             lastLoginTime: '',
    //         },
    //         category: [],
    //         versions: [],
    //         milestone: [],
    //         startDate: null,
    //         dueDate: "2024-02-06T00:00:00Z",
    //         estimatedHours: null,
    //         actualHours: null,
    //         parentIssueId: null,
    //         createdUser: {
    //             id: 557059,
    //             userId: '',
    //             name: 'Chika Harada',
    //             roleType: 1,
    //             lang: 'ja',
    //             mailAddress: '',
    //             lastLoginTime: '',
    //         },
    //         created: "2024-01-15T08:24:41Z",
    //         updatedUser: {
    //             id: 570826,
    //             userId: '*1NhzVopKiQ',
    //             name: '酒井大地',
    //             roleType: 2,
    //             lang: 'ja',
    //             mailAddress: '',
    //             lastLoginTime: '',
    //         },
    //         updated: "2024-01-28T08:23:08Z",
    //         customFields: [],
    //         attachments: [],
    //         sharedFiles: [],
    //         stars: [],
    //     },
    //     {
    //         id: 39086536,
    //         projectId: 196135,
    //         issueKey: "DEVOPS-2",
    //         keyId: 2,
    //         issueType: {
    //             id: 1053517,
    //             projectId: 196135,
    //             name: 'Bug',
    //             color: '#e19d92',
    //             displayOrder: 1,
    //         },
    //         summary: "環境設定の問題",
    //         description: "開発環境にてビルドエラーが発生しています...",
    //         resolution: null,
    //         priority: {
    //             id: 4,
    //             name: "高",
    //         },
    //         status: {
    //             id: 2,
    //             projectId: 196135,
    //             name: '対応中',
    //             color: '#ff9200',
    //             displayOrder: 2000,
    //         },
    //         assignee: {
    //             id: 570827,
    //             userId: 'devopsUser',
    //             name: '開発運用 太郎',
    //             roleType: 2,
    //             lang: 'ja',
    //             mailAddress: 'devops@example.com',
    //             lastLoginTime: '2024-01-25T12:34:56Z',
    //         },
    //         category: [],
    //         versions: [],
    //         milestone: [],
    //         startDate: "2024-01-20T00:00:00Z",
    //         dueDate: "2024-01-30T00:00:00Z",
    //         estimatedHours: 8,
    //         actualHours: 2,
    //         parentIssueId: null,
    //         createdUser: {
    //             id: 557060,
    //             userId: 'admin',
    //             name: '管理者',
    //             roleType: 1,
    //             lang: 'ja',
    //             mailAddress: 'admin@example.com',
    //             lastLoginTime: '2024-01-22T10:20:30Z',
    //         },
    //         created: "2024-01-20T09:15:30Z",
    //         updatedUser: {
    //             id: 570828,
    //             userId: 'updateUser',
    //             name: '更新 太郎',
    //             roleType: 2,
    //             lang: 'ja',
    //             mailAddress: 'update@example.com',
    //             lastLoginTime: '2024-01-27T14:15:16Z',
    //         },
    //         updated: "2024-01-27T14:15:16Z",
    //         customFields: [],
    //         attachments: [],
    //         sharedFiles: [],
    //         stars: [],
    //     },
    //     {
    //         id: 39086537,
    //         projectId: 196138,
    //         issueKey: "MARKETING-3",
    //         keyId: 3,
    //         issueType: {
    //             id: 1053518,
    //             projectId: 196138,
    //             name: 'Improvement',
    //             color: '#669933',
    //             displayOrder: 2,
    //         },
    //         summary: "新しいキャンペーンの企画",
    //         description: "次四半期の主要キャンペーンの企画を開始...",
    //         resolution: null,
    //         priority: {
    //             id: 2,
    //             name: "低",
    //         },
    //         status: {
    //             id: 3,
    //             projectId: 196138,
    //             name: '完了',
    //             color: '#59abe3',
    //             displayOrder: 3000,
    //         },
    //         assignee: {
    //             id: 570829,
    //             userId: 'marketingUser',
    //             name: 'マーケ 太郎',
    //             roleType: 2,
    //             lang: 'ja',
    //             mailAddress: 'marketing@example.com',
    //             lastLoginTime: '2024-02-01T08:30:00Z',
    //         },
    //         category: [],
    //         versions: [],
    //         milestone: [],
    //         startDate: "2024-01-25T00:00:00Z",
    //         dueDate: "2024-02-05T00:00:00Z",
    //         estimatedHours: 40,
    //         actualHours: 35,
    //         parentIssueId: null,
    //         createdUser: {
    //             id: 557061,
    //             userId: 'creativeDirector',
    //             name: 'クリエイティブ 太郎',
    //             roleType: 1,
    //             lang: 'ja',
    //             mailAddress: 'creative@example.com',
    //             lastLoginTime: '2024-01-24T14:00:00Z',
    //         },
    //         created: "2024-01-24T13:45:00Z",
    //         updatedUser: {
    //             id: 570830,
    //             userId: 'updateUser2',
    //             name: '更新 花子',
    //             roleType: 2,
    //             lang: 'ja',
    //             mailAddress: 'update2@example.com',
    //             lastLoginTime: '2024-02-04T16:20:00Z',
    //         },
    //         updated: "2024-02-04T16:20:00Z",
    //         customFields: [],
    //         attachments: [],
    //         sharedFiles: [],
    //         stars: [],
    //     },
    //     {
    //         id: 39086538,
    //         projectId: 196139,
    //         issueKey: "SALES-4",
    //         keyId: 4,
    //         issueType: {
    //             id: 1053519,
    //             projectId: 196139,
    //             name: 'Request',
    //             color: '#cc3333',
    //             displayOrder: 3,
    //         },
    //         summary: "顧客データベースの更新",
    //         description: "顧客情報の最新化を行い、セグメントごとに整理...",
    //         resolution: null,
    //         priority: {
    //             id: 5,
    //             name: "最低",
    //         },
    //         status: {
    //             id: 4,
    //             projectId: 196139,
    //             name: '作業中',
    //             color: '#f39c12',
    //             displayOrder: 4000,
    //         },
    //         assignee: {
    //             id: 570831,
    //             userId: 'salesManager',
    //             name: '営業部長',
    //             roleType: 2,
    //             lang: 'ja',
    //             mailAddress: 'sales@example.com',
    //             lastLoginTime: '2024-02-02T09:15:00Z',
    //         },
    //         category: [],
    //         versions: [],
    //         milestone: [],
    //         startDate: "2024-01-28T00:00:00Z",
    //         dueDate: "2024-02-15T00:00:00Z",
    //         estimatedHours: 20,
    //         actualHours: 5,
    //         parentIssueId: null,
    //         createdUser: {
    //             id: 557062,
    //             userId: 'salesRep',
    //             name: '営業 太郎',
    //             roleType: 1,
    //             lang: 'ja',
    //             mailAddress: 'salesrep@example.com',
    //             lastLoginTime: '2024-01-27T11:30:00Z',
    //         },
    //         created: "2024-01-27T11:20:00Z",
    //         updatedUser: {
    //             id: 570832,
    //             userId: 'updateUser3',
    //             name: '更新 三郎',
    //             roleType: 2,
    //             lang: 'ja',
    //             mailAddress: 'update3@example.com',
    //             lastLoginTime: '2024-02-03T17:45:00Z',
    //         },
    //         updated: "2024-02-03T17:45:00Z",
    //         customFields: [],
    //         attachments: [],
    //         sharedFiles: [],
    //         stars: [],
    //     },
    // ];


    const { path } = usePath();
    const { user } = useAuth();
    const [searchInput, setSearchInput] = useState('');
    const [fullSpaceUrl, setFullSpaceUrl] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [projects, setProjects] = useState<Project[]>([]);
    const [favoriteProjectList, setFavoriteProjectsList] = useState<FavoriteProject[]>([]);
    const [favoriteProjects, setFavoriteProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [favoriteTaskList, setFavoriteTaskList] = useState<FavoriteTask[]>([]);
    const [favoriteTasks, setFavoriteTasks] = useState<Task[]>([]);


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
                    console.log("projects:", response.data);
                    console.log("favProjects:", favResponse.data);
                    setProjects(response.data);
                    setFavoriteProjectsList(favResponse.data)
                } else if (path === 'tasks') {
                    console.log("tasks:", response.data);
                    console.log("favTasks:", favResponse.data);
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
        if (!projects || projects.length === 0 || !favoriteProjectList || favoriteProjectList.length === 0) return;

        const favoriteProjectsDetails: Project[] = projects.filter(project =>
            Array.isArray(favoriteProjectList) && favoriteProjectList.some(favProject => favProject.projectID === project.id)
        );
        setFavoriteProjects(favoriteProjectsDetails);
    }, [projects, favoriteProjectList]);

    useEffect(() => {
        if (!tasks || tasks.length === 0 || !favoriteTaskList || favoriteTaskList.length === 0) return;

        const favoriteTasksDetails: Task[] = tasks.filter(task =>
            Array.isArray(favoriteTaskList) && favoriteTaskList.some(favTask => favTask.taskID === task.id)
        );
        setFavoriteTasks(favoriteTasksDetails);
    }, [tasks, favoriteTaskList]);


    const backlogOAuth = (!user?.backlog_oauth) && (path === 'projects' || path === 'tasks')
    // const backlogOAuth = ""

    function sortByLatestDate(a: Task, b: Task) {
        const dateA = new Date(a.updated || a.created);
        const dateB = new Date(b.updated || b.created);
        return dateB.getTime() - dateA.getTime();
    }

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
                    {path === 'projects' && <Projects projects={projects} favoriteProjects={favoriteProjects} />}
                    {path === 'tasks' && <Tasks tasks={tasks} favoriteTasks={favoriteTasks} sortedByDate={sortByLatestDate} />}
                </>
            }
        </div>
    )
}
