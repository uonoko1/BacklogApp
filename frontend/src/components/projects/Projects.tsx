import React from 'react'
import './Projects.css'
import { FavoriteProject, Project } from '../../types/Backlog'
import axios from 'axios';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

interface ProjectsProps {
    projects: Project[];
    favoriteProjects: Project[];
    checkedStates: { [key: number]: boolean };
    setCheckedStates: React.Dispatch<React.SetStateAction<{ [key: number]: boolean }>>;
    favoriteList: FavoriteProject[];
    setFavoriteList: React.Dispatch<React.SetStateAction<FavoriteProject[]>>;
    handleClickProject: (id: number) => void;
}

export default function Projects({ projects, favoriteProjects, checkedStates, setCheckedStates, favoriteList, setFavoriteList, handleClickProject }: ProjectsProps) {

    const handleCheckBox = async (id: number) => {
        const newState = !checkedStates[id];
        setCheckedStates({
            ...checkedStates,
            [id]: newState
        });

        try {
            if (newState) {
                await axios.post(`${process.env.REACT_APP_API_URL}/api/fav/project/${id}`);
                const newFavoriteItem = { project_id: id, created_at: new Date().toISOString() };
                setFavoriteList([...(favoriteList || []), newFavoriteItem]);
            } else {
                await axios.delete(`${process.env.REACT_APP_API_URL}/api/fav/project/${id}`);
                const updatedFavoriteList = (favoriteList || []).filter(favProject => favProject.project_id !== id);
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

    return (
        <div className='projectsContent'>
            <div className='Favorite'>
                <h4>お気に入り</h4>
                <div className='projectItem'>
                    <p className='projectId'>ID</p>
                    <p className='projectKey'>キー</p>
                    <p className='projectName'>プロジェクト名</p>
                </div>
                <ul>
                    {favoriteProjects.map((project) => {
                        return (
                            <li key={project.id} onClick={() => handleClickProject(project.id)}>
                                <HighlightOffIcon className='deleteIcon' onClick={() => handleCheckBox(project.id)} />
                                <p className='projectId'>{project.id}</p>
                                <p className='projectKey'>{project.projectKey}</p>
                                <p className='projectName'>{project.name}</p>
                            </li>
                        )
                    })}
                </ul>
            </div>
            <div className='SearchResult'>
                <h4>検索結果(新しい順)</h4>
                <div className='projectItem'>
                    <p className='projectId'>ID</p>
                    <p className='projectKey'>キー</p>
                    <p className='projectName'>プロジェクト名</p>
                </div>
                <ul>
                    {projects.map((project) => {
                        return (
                            <li key={project.id} onClick={() => handleClickProject(project.id)}>
                                <input
                                    type="checkbox"
                                    checked={!!checkedStates[project.id]}
                                    onChange={() => handleCheckBox(project.id)}
                                />
                                <p className='projectId'>{project.id}</p>
                                <p className='projectKey'>{project.projectKey}</p>
                                <p className='projectName'>{project.name}</p>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    )
}
