package model

type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

type Project struct {
	ID                                int    `json:"id"`
	ProjectKey                        string `json:"projectKey"`
	Name                              string `json:"name"`
	ChartEnabled                      bool   `json:"chartEnabled"`
	UseResolvedForChart               bool   `json:"useResolvedForChart"`
	SubtaskingEnabled                 bool   `json:"subtaskingEnabled"`
	ProjectLeaderCanEditProjectLeader bool   `json:"projectLeaderCanEditProjectLeader"`
	UseWiki                           bool   `json:"useWiki"`
	UseFileSharing                    bool   `json:"useFileSharing"`
	UseWikiTreeView                   bool   `json:"useWikiTreeView"`
	UseSubversion                     bool   `json:"useSubversion"`
	UseGit                            bool   `json:"useGit"`
	UseOriginalImageSizeAtWiki        bool   `json:"useOriginalImageSizeAtWiki"`
	TextFormattingRule                string `json:"textFormattingRule"`
	Archived                          bool   `json:"archived"`
	DisplayOrder                      int    `json:"displayOrder"`
	UseDevAttributes                  bool   `json:"useDevAttributes"`
}

type Task struct {
	ID             int           `json:"id"`
	ProjectID      int           `json:"projectId"`
	IssueKey       string        `json:"issueKey"`
	KeyID          int           `json:"keyId"`
	IssueType      IssueType     `json:"issueType"`
	Summary        string        `json:"summary"`
	Description    string        `json:"description"`
	Resolution     interface{}   `json:"resolution"`
	Priority       Priority      `json:"priority"`
	Status         Status        `json:"status"`
	Assignee       BacklogUser   `json:"assignee"`
	Category       []Category    `json:"category"`
	Versions       []Version     `json:"versions"`
	Milestone      []Milestone   `json:"milestone"`
	StartDate      interface{}   `json:"startDate"`
	DueDate        interface{}   `json:"dueDate"`
	EstimatedHours interface{}   `json:"estimatedHours"`
	ActualHours    interface{}   `json:"actualHours"`
	ParentIssueId  interface{}   `json:"parentIssueId"`
	CreatedUser    BacklogUser   `json:"createdUser"`
	Created        string        `json:"created"`
	UpdatedUser    BacklogUser   `json:"updatedUser"`
	Updated        string        `json:"updated"`
	CustomFields   []CustomField `json:"customFields"`
	Attachments    []Attachment  `json:"attachments"`
	SharedFiles    []SharedFile  `json:"sharedFiles"`
	Stars          []Star        `json:"stars"`
}

type IssueType struct {
	ID           int    `json:"id"`
	ProjectID    int    `json:"projectId"`
	Name         string `json:"name"`
	Color        string `json:"color"`
	DisplayOrder int    `json:"displayOrder"`
}

type Priority struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type Status struct {
	ID           int    `json:"id"`
	ProjectID    int    `json:"projectId"`
	Name         string `json:"name"`
	Color        string `json:"color"`
	DisplayOrder int    `json:"displayOrder"`
}

type BacklogUser struct {
	ID            int    `json:"id"`
	UserID        string `json:"userId"`
	Name          string `json:"name"`
	RoleType      int    `json:"roleType"`
	Lang          string `json:"lang"`
	MailAddress   string `json:"mailAddress"`
	LastLoginTime string `json:"lastLoginTime"`
}

type Category struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type Version struct {
	ID             int    `json:"id"`
	ProjectID      int    `json:"projectId"`
	Name           string `json:"name"`
	Description    string `json:"description"`
	StartDate      string `json:"startDate,omitempty"`
	ReleaseDueDate string `json:"releaseDueDate,omitempty"`
	Archived       bool   `json:"archived"`
	DisplayOrder   int    `json:"displayOrder"`
}

type Milestone struct {
	ID             int    `json:"id"`
	ProjectID      int    `json:"projectId"`
	Name           string `json:"name"`
	Description    string `json:"description"`
	StartDate      string `json:"startDate,omitempty"`
	ReleaseDueDate string `json:"releaseDueDate,omitempty"`
	Archived       bool   `json:"archived"`
	DisplayOrder   int    `json:"displayOrder"`
}

type CustomField struct {
	ID        int         `json:"id"`
	FieldType int         `json:"fieldType"`
	Name      string      `json:"name"`
	Value     interface{} `json:"value"`
}

type Attachment struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	Size int    `json:"size"`
}

type SharedFile struct {
	ID          int         `json:"id"`
	Type        string      `json:"type"`
	Dir         string      `json:"dir"`
	Name        string      `json:"name"`
	Size        int         `json:"size"`
	CreatedUser BacklogUser `json:"createdUser"`
	Created     string      `json:"created"`
	UpdatedUser BacklogUser `json:"updatedUser"`
	Updated     string      `json:"updated"`
}

type Star struct {
	ID        int         `json:"id"`
	Comment   string      `json:"comment,omitempty"`
	URL       string      `json:"url"`
	Title     string      `json:"title"`
	Presenter BacklogUser `json:"presenter"`
	Created   string      `json:"created"`
}

type Comment struct {
	ID            int            `json:"id"`
	ProjectID     int            `json:"projectId"`
	IssueID       int            `json:"issueId"`
	Content       string         `json:"content"`
	ChangeLog     *[]interface{} `json:"changeLog"`
	CreatedUser   CreatedUser    `json:"createdUser"`
	Created       string         `json:"created"`
	Updated       string         `json:"updated"`
	Stars         []interface{}  `json:"stars"`
	Notifications []interface{}  `json:"notifications"`
}

type CreatedUser struct {
	ID            int          `json:"id"`
	UserID        string       `json:"userId"`
	Name          string       `json:"name"`
	RoleType      int          `json:"roleType"`
	Lang          string       `json:"lang"`
	NulabAccount  NulabAccount `json:"nulabAccount"`
	MailAddress   string       `json:"mailAddress"`
	LastLoginTime string       `json:"lastLoginTime"`
}

type NulabAccount struct {
	NulabID  string `json:"nulabId"`
	Name     string `json:"name"`
	UniqueID string `json:"uniqueId"`
}
