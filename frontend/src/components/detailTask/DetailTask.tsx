import React, { useEffect, useState } from 'react'
import './DetailTask.css'
import { Task, Comment } from '../../types/Backlog';
import Description from '../../utils/Description';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { TailSpin } from 'react-loader-spinner';

interface DetailTaskProps {
    tasks: Task[];
}

export default function DetailTask({ tasks }: DetailTaskProps) {
    // const a: Comment =
    // {
    //     id: 217473568,
    //     projectId: 196134,
    //     issueId: 39086535,
    //     content: '@Tatsuru Wakimoto \n早速のご回答ありがとうございます！\n先ほど添付の箇所をドキュメントで確認し、理解いたしました。\n\nサンプル要件をいただいたところ恐縮ですが、\n今回はお言葉に甘えてプロジェクト一覧・課題一覧の取得をするアプリケーションで開発させていただきます。\n\n引き続き不明点が生じましたらご相談させていただければと存じますので、\n何卒よろしくお願いいたします。',
    //     changeLog: null, // nullを明示的に設定
    //     createdUser: {
    //         id: 570826,
    //         userId: '*1NhzVopKiQ',
    //         name: '酒井大地',
    //         roleType: 2,
    //         lang: 'ja',
    //         nulabAccount: {
    //             nulabId: 'Prm9ZD9DQD5snNWcSYSwZiQoA9WFBUEa2ySznrSnSQRhdC2X8G',
    //             name: 'admin',
    //             uniqueId: 'admin'
    //         },
    //         mailAddress: 'eguchi@nulab.example',
    //         lastLoginTime: '2022-09-01T06:35:39Z'
    //     },
    //     created: '2024-02-01T07:09:35Z',
    //     updated: '2024-02-01T07:09:35Z',
    //     stars: [], // 空の配列を設定
    //     notifications: [], // 空の配列を設定
    // };
    // const b: Comment =
    // {
    //     id: 217466125,
    //     projectId: 196134,
    //     issueId: 39086535,
    //     content: '@酒井大地 \n回答としては、更新情報の取得を想定しておりましたので、\n下記のURLの説明にレスポンス説明にtypeの内容が記載しているので、文字列に置き換えて頂く事を想定していました。\ndeveloper.nulab.com/ja/docs/backlog/api/2/get-recent-updates/#\n\nこの部分ですね。\n![image][pasted-2024.02.01-15.35.54.png]\n\nただし、プロジェクト一覧・課題一覧を取得する場合は不要ですので、そのまま進めて頂いてかまいません。:blush: ',
    //     changeLog: null, // nullを明示的に設定
    //     createdUser: {
    //         id: 564045,
    //         userId: '',
    //         name: 'Tatsuru Wakimoto',
    //         roleType: 2,
    //         lang: 'ja',
    //         nulabAccount: {
    //             nulabId: '別のNulabId',
    //             name: 'Tatsuru Wakimoto',
    //             uniqueId: '別のUniqueId'
    //         },
    //         mailAddress: 'tatsuru@example.com',
    //         lastLoginTime: '2024-01-01T00:00:00Z'
    //     },
    //     created: '2024-02-01T06:41:39Z',
    //     updated: '2024-02-01T06:41:39Z',
    //     stars: [], // 空の配列を設定
    //     notifications: [], // 空の配列を設定
    // };


    const [selectTask, setSelectTask] = useState<Task | null>(null);
    const taskId = useParams().taskId;
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [comments, setComments] = useState<Comment[] | null>([]);
    const [openEditor, setOpenEditor] = useState(false);
    const [inputComment, setInputComment] = useState('');


    useEffect(() => {
        const fetchTaskDetail = async () => {
            try {
                const taskNumId = Number(taskId)
                const findTask = tasks.find((task) => task.id === taskNumId)
                setSelectTask(findTask !== undefined ? findTask : null);
            } catch (err) {
                console.log('タスクの詳細データの取得に失敗しました。', err);
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
                console.log('コメント一覧:', response.data)
            } catch (err) {
                console.log('err:', err);
            } finally {
                setIsLoading(false);
            }
        }

        if (selectTask) fetchTaskComments();
    }, [selectTask])

    const formatDateTime = (dateTimeString: string): string => {
        const date = new Date(dateTimeString);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');

        return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
    };

    const sortCommentsByDate = (comments: Comment[]) => {
        return comments.sort((a, b) => {
            return new Date(a.created).getTime() - new Date(b.created).getTime();
        });
    };

    const handleCloseInput = () => {
        if (openEditor) setOpenEditor(false);
    }

    const generateComment = async () => {
        if (!selectTask || !comments) return;

        const data = {
            issueTitle: selectTask.summary,
            issueDescription: selectTask.description,
            existingComments: comments.map(comment => comment.content),
        };

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/backlog/autoComment`, data);
            setInputComment(response.data);
        } catch (err) {
            console.error('コメント生成エラー:', err);
        }
    }

    const onSubmit = async () => {
        if (!inputComment) return;
        setIsLoading(true);
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/backlog/comment/submit`, {
                taskId: selectTask?.id,
                comment: inputComment
            })
            setComments(prevComments => [...(prevComments || []), response.data]);
            setInputComment('');
        } catch (err) {
            console.log("err:", err);
        } finally {
            setIsLoading(false);
        }
    }

    if (selectTask) {
        return (
            <div className='DetailTaskContent' onClick={handleCloseInput}>
                <div className='DetailTaskTitle'>
                    <ArrowBackIosNewIcon className='backIcon' onClick={() => navigate('/tasks')} />
                    <h2>{selectTask.summary}</h2>
                </div>
                <div className='taskDialog'>
                    <div className='taskTop'>
                        <div className='createdUser'>
                            <img src={`${process.env.REACT_APP_URL}/assets/icon_backlog.svg`} alt='userImg' className='userImg' />
                            <div className='createdUserInfo'>
                                <p className='createdUsername'>{selectTask.createdUser.name}</p>
                                <p className='createdDate'>登録日 {formatDateTime(selectTask.created)}</p>
                            </div>
                        </div>
                        <div className='taskDescription'>
                            <Description description={selectTask.description} />
                        </div>
                        <div className='taskProperties'>
                            <div className='TaskPriority'>
                                <div className='TaskPriorityLabel'>優先度</div>
                                <div className='TaskPriorityValue'>{selectTask.priority.name}</div>
                            </div>
                            <div className='TaskAssigner'>
                                <div className='TaskAssignerLable'>担当者</div>
                                <div className='TaskAssignerValue'>{selectTask.assignee.name}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='taskComments'>
                    <p className='commentLabel'>コメント<span className='numberOfComment'>({comments ? comments.length : 0})</span></p>
                    {comments && comments.length > 0 &&
                        <ul className='commentDialog'>
                            {comments && sortCommentsByDate(comments).map((comment, index) => (
                                <li key={comment.id}>
                                    <div className={`${index !== 0 ? 'innerList' : ''} listItem`}>
                                        <div className='createdUser'>
                                            <img src={`${process.env.REACT_APP_URL}/assets/icon_backlog.svg`} alt='userImg' className='userImg' />
                                            <div className='createdUserInfo'>
                                                <p className='createdUsername'>{comment.createdUser.name}</p>
                                                <p className='createdDate'>{formatDateTime(comment.created)}</p>
                                            </div>
                                        </div>
                                        <div className='commentContent'>
                                            <Description description={comment.content} />
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    }
                </div>
                <div className='commentEditor' onClick={(e) => e.stopPropagation()}>
                    <form className='commentForm'>
                        <div className='commentFormBody'>
                            <textarea
                                className={`commentTextarea ${openEditor ? 'openEditor' : ''}`}
                                placeholder='コメント (@を入力してメンバーに通知)'
                                value={inputComment}
                                onChange={(e) => setInputComment(e.target.value)}
                                onClick={() => setOpenEditor(true)}
                            />
                            {openEditor &&
                                <>
                                    <button type='button' onClick={generateComment} className='autoComment'>
                                        <PsychologyIcon />
                                    </button>
                                </>}
                        </div>
                        {openEditor &&
                            <>
                                <div className='commentButton'>
                                    {isLoading ?
                                        <div className='TailSpinContent'>
                                            <TailSpin color='#00BFFF' height={30} width={30} />
                                        </div>
                                        :
                                        <>
                                            <button type='button'>閉じる</button>
                                            <button type='button' onClick={onSubmit} className='rightButton'>投稿</button>
                                        </>
                                    }
                                </div>
                            </>}
                    </form>
                </div>
            </div>
        )
    } else {
        return null;
    }
}
