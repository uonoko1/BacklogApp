import React, { useEffect, useState } from 'react'
import "./Center.css"
import SearchIcon from '@mui/icons-material/Search';
import { usePath } from '../../state/PathContext';
import { useAuth } from '../../state/AuthContext';
import axios from 'axios';
import Tasks from '../tasks/Tasks';
import Projects from '../projects/Projects';
import { FavoriteProject, FavoriteTask, Project, Task } from '../../types/Backlog';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Center() {
    // const taskData: Task = {
    //     id: 39086535,
    //     projectId: 196134,
    //     issueKey: "SAKAI-1",
    //     keyId: 1,
    //     issueType: {
    //         id: 1053516,
    //         projectId: 196134,
    //         name: 'Task',
    //         color: '#7ea800',
    //         displayOrder: 0
    //     },
    //     summary: "Backlogの課題",
    //     description: "ログインいただき、ありがとうございます。こちらが課題用のBacklogです。開発部長はじめBacklogの開発チームのメンバーも入っております。\n早速ですが課題についてのご案内いたします。\n\n## お題\n- 当社の用意した、下記サンプルアプリケーションの要件を元に開発をお願いたします。\nhttps://cacoo.com/diagrams/1onE3QAGNty4XLTy/3BD85\n\n- 言語は、Java(Kotlin) / Scala / Python / Goのうち、いずれかでお願いしておりますが\nBacklog課のメンバーより、TypeScriptかGoに挑戦してもらえたら嬉しいと、承っております。\n\n### 規模、内容について\n- コードの規模や内容は特に問いませんが、書き捨てではなく、\n  なるべく実力がわかるような内容をご提示いただければありがたいです。\n- 実力というのは、ヌーラボの中で長期的にサービス開発・運用をしていくことを想定したものです。\n- サービスを開発、運用するためのお力を十分に伝えることができるものをご提出ください。\n- 規模や内容は問いません。手を抜くところは抜いていただいて問題ありませんが、\n  その箇所や理由を明確に提示していただけると、こちらも評価しやすいです。\n\n### Backlogの使い方について\n- ソースコード管理はこのBacklogプロジェクトのGitリポジトリを利用してください。\n- 課題やWikiなどその他の機能も必要に応じて利用してください。\n- その他、プロジェクト管理者でないと変更できない設定等が必要な場合はお気軽にお声がけください。\n\n## 参考：各チームで使っている言語\n- Backlog : Scala (Play Framework)\n- Cacoo : Go\n- Typetalk : Scala (Play Framework)\n- Nulab Apps : Java (Spring) , Kotlin\n- バックオフィスエンジニア：Python, Google Apps Script, Scala (Play Framework)\n\n## Backlogをご利用いただくにあたって\n- メンション( @ ) にさんづけ・様づけは不要です :thumbsup: \n- 採用選考ではありますが、コメントをいただく際にメールの様に宛名を付けていただかなくても大丈夫です。\n- メンションは昼夜問わずお気軽に付けてください！コメントいただいたことに気づかないことがあります。\n\n## 補足\n- ヌーラボのAPIを利用する際に、APIキーではなくOAuth 2.0 の認可方式を使っていただきたいです。\n　　例：https://developer.nulab.com/ja/docs/backlog/auth/#oauth-2-0\n- またWebアプリケーションを作られる場合、HerokuやGoogle App Engineなどすぐ試せる環境にあげていただけると助かります。\n- 期間は3週間程度でご対応いただけると助かりますが、難しい場合はご相談くださいませ。\n  まずはこのBacklogにログインされたらコメントお願いいたします。\n",
    //     resolution: null,
    //     priority: {
    //         id: 3,
    //         name: '中'
    //     },
    //     status: {
    //         id: 2,
    //         projectId: 196134,
    //         name: '処理中',
    //         color: '#4488c5',
    //         displayOrder: 2000
    //     },
    //     assignee: {
    //         id: 570826,
    //         userId: '*1NhzVopKiQ',
    //         name: '酒井大地',
    //         roleType: 2,
    //         lang: 'ja',
    //         mailAddress: '',
    //         lastLoginTime: ''
    //     },
    //     category: [],
    //     versions: [],
    //     milestone: [],
    //     startDate: null,
    //     dueDate: "2024-02-06T00:00:00Z",
    //     estimatedHours: null,
    //     actualHours: null,
    //     parentIssueId: null,
    //     createdUser: {
    //         id: 557059,
    //         userId: '',
    //         name: 'Chika Harada',
    //         roleType: 1,
    //         lang: 'ja',
    //         mailAddress: '',
    //         lastLoginTime: ''
    //     },
    //     created: "2024-01-15T08:24:41Z",
    //     updatedUser: {
    //         id: 570826,
    //         userId: '*1NhzVopKiQ',
    //         name: '酒井大地',
    //         roleType: 2,
    //         lang: 'ja',
    //         mailAddress: '',
    //         lastLoginTime: ''
    //     },
    //     updated: "2024-02-01T07:09:35Z",
    //     customFields: [],
    //     attachments: [],
    //     sharedFiles: [],
    //     stars: []
    // };


    const { path } = usePath();
    const { user } = useAuth();
    const [searchInput, setSearchInput] = useState('');
    const [fullSpaceUrl, setFullSpaceUrl] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [projects, setProjects] = useState<Project[]>([]);
    const [displayProjects, setDisplayProjects] = useState<Project[]>([]);
    const [favoriteProjectList, setFavoriteProjectList] = useState<FavoriteProject[]>([]);
    const [favoriteProjects, setFavoriteProjects] = useState<Project[]>([]);
    const [checkedProjectStates, setCheckedProjectStates] = useState<{ [key: number]: boolean }>({});
    const [tasks, setTasks] = useState<Task[]>([]);
    const [displayTasks, setDisplayTasks] = useState<Task[]>([]);
    const [favoriteTaskList, setFavoriteTaskList] = useState<FavoriteTask[]>([]);
    const [favoriteTasks, setFavoriteTasks] = useState<Task[]>([]);
    const [checkedTaskStates, setCheckedTaskStates] = useState<{ [key: number]: boolean }>({});
    const navigate = useNavigate();
    const location = useLocation();

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
                    setDisplayProjects(response.data);
                    setFavoriteProjectList(favResponse.data)
                } else if (path === 'tasks') {
                    // console.log("tasks:", response.data);
                    setTasks(response.data);
                    setDisplayTasks(response.data);
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

    const backlogOAuth = (!user?.backlog_oauth) && (path === 'projects' || path === 'tasks');
    // const backlogOAuth = ''

    const placeholder = () => {
        switch (path) {
            case 'projects':
                return 'プロジェクト名';
            case 'tasks':
                return '件名';
            default:
                return '';
        }
    }

    const handleSearch = (value: string) => {
        setSearchInput(value);

        if (path === 'projects') {
            const filterProjects = projects.filter((project) =>
                project.name.toLowerCase().includes(value.toLowerCase())
            );
            setDisplayProjects(filterProjects);
        }
        if (path === 'tasks') {
            const filterTasks = tasks.filter((task) =>
                task.summary.toLowerCase().includes(value.toLowerCase())
            );
            setDisplayTasks(filterTasks);
        }
    };

    const handleClickProject = (id: number) => {
        const filterTasks = tasks.filter((task) => task.projectId === id)
        setDisplayTasks(filterTasks);
        navigate('/tasks')
    }

    useEffect(() => {
        setSearchInput('');
        if (projects) setDisplayProjects(projects);
        if (tasks) setDisplayTasks(tasks);
    }, [location])

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
                        <input type='text' value={searchInput} onChange={(e) => handleSearch(e.target.value)} placeholder={placeholder()} className='SearchBoxInput' />
                    </div>
                    {path === 'projects' && (
                        <Projects
                            projects={displayProjects}
                            favoriteProjects={favoriteProjects}
                            checkedStates={checkedProjectStates}
                            setCheckedStates={setCheckedProjectStates}
                            favoriteList={favoriteProjectList}
                            setFavoriteList={setFavoriteProjectList}
                            handleClickProject={handleClickProject}
                        />
                    )}
                    {path === 'tasks' && (
                        <Tasks
                            tasks={displayTasks}
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
