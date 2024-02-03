export interface IssueType {
    id: number;
    projectId: number;
    name: string;
    color: string;
    displayOrder: number;
}

export interface Priority {
    id: number;
    name: string;
}

export interface Status {
    id: number;
    projectId: number;
    name: string;
    color: string;
    displayOrder: number;
}

export interface BacklogUser {
    id: number;
    userId: string;
    name: string;
    roleType: number;
    lang: string;
    mailAddress: string;
    lastLoginTime: string;
}

export interface Category {
    id: number;
    name: string;
}

export interface Version {
    id: number;
    projectId: number;
    name: string;
    description: string;
    startDate?: string;
    releaseDueDate?: string;
    archived: boolean;
    displayOrder: number;
}

export interface Milestone extends Version { }

export interface CustomField {
    id: number;
    fieldType: number;
    name: string;
    value: any;
}

export interface Attachment {
    id: number;
    name: string;
    size: number;
}

export interface SharedFile {
    id: number;
    type: string;
    dir: string;
    name: string;
    size: number;
    createdUser: BacklogUser;
    created: string;
    updatedUser: BacklogUser;
    updated: string;
}

export interface Star {
    id: number;
    comment?: string;
    url: string;
    title: string;
    presenter: BacklogUser;
    created: string;
}

export interface Task {
    id: number;
    projectId: number;
    issueKey: string;
    keyId: number;
    issueType: IssueType;
    summary: string;
    description: string;
    resolution: any;
    priority: Priority;
    status: Status;
    assignee: BacklogUser;
    category: Category[];
    versions: Version[];
    milestone: Milestone[];
    startDate: any;
    dueDate: any;
    estimatedHours: any;
    actualHours: any;
    parentIssueId: any;
    createdUser: BacklogUser;
    created: string;
    updatedUser: BacklogUser;
    updated: string;
    customFields: CustomField[];
    attachments: Attachment[];
    sharedFiles: SharedFile[];
    stars: Star[];
}

export interface Project {
    id: number;
    projectKey: string;
    name: string;
    chartEnabled: boolean;
    useResolvedForChart: boolean;
    subtaskingEnabled: boolean;
    projectLeaderCanEditProjectLeader: boolean;
    useWiki: boolean;
    useFileSharing: boolean;
    useWikiTreeView: boolean;
    useSubversion: boolean;
    useGit: boolean;
    useOriginalImageSizeAtWiki: boolean;
    textFormattingRule: string;
    archived: boolean;
    displayOrder: number;
    useDevAttributes: boolean;
}

export interface FavoriteProject {
    project_id: number;
    created_at: string;
}

export interface FavoriteTask {
    task_id: number;
    created_at: string;
}

export interface Comment {
    id: number;
    projectId: number;
    issueId: number;
    content: string;
    changeLog?: null;
    createdUser: CreatedUser;
    created: string;
    updated: string;
    stars: any[];
    notifications: any[];
}

interface CreatedUser {
    id: number;
    userId: string;
    name: string;
    roleType: number;
    lang: string;
    nulabAccount: NulabAccount;
    mailAddress: string;
    lastLoginTime: string;
}

interface NulabAccount {
    nulabId: string;
    name: string;
    uniqueId: string;
}