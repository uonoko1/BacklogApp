import React, { useState, useEffect } from 'react'
import "./ListItem.css"
import { usePath } from '../../state/PathContext'
import axios from 'axios';

export default function ListItem() {
    interface CommonItem {
        id: number;
        name: string;
    }

    interface Project extends CommonItem {
        projectKey: string,
    }
    interface Task extends CommonItem {
        projectKey: string,
    }
    interface User extends CommonItem {
        projectKey: string,
    }
    interface Team extends CommonItem {
        projectKey: string,
    }

    const { path } = usePath();
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [displayItems, setDisplayItems] = useState<(Project | Task | User | Team)[]>([]);


    useEffect(() => {
        const fetchData = async () => {
            let url = `${process.env.REACT_APP_API_URL}/api/`;
            let response;

            switch (path) {
                case 'projects':
                    url += 'projects';
                    response = await axios.get(url);
                    setProjects(response.data);
                    break;
                case 'users':
                    url += 'users';
                    response = await axios.get(url);
                    setUsers(response.data);
                    break;
                case 'tasks':
                    url += 'tasks';
                    response = await axios.get(url);
                    setTasks(response.data);
                    break;
                case 'teams':
                    url += 'teams';
                    response = await axios.get(url);
                    setTeams(response.data);
                    break;
                default:
                    url += 'projects';
                    response = await axios.get(url);
                    setProjects(response.data);
            }
        };

        // fetchData();
    }, [path]);


    useEffect(() => {
        let data: (Project | User | Task | Team)[] = [];

        switch (path) {
            case 'projects':
                data = projects;
                break;
            case 'users':
                data = users;
                break;
            case 'tasks':
                data = tasks;
                break;
            case 'teams':
                data = teams;
                break;
            default:
                data = projects;
        }

        setDisplayItems(data);
    }, [path, projects, users, tasks, teams]);

    return (
        <>
            {displayItems.map((item) => {
                return (
                    <li>
                        {item.name}
                    </li>
                )
            })}
        </>
    )
}
