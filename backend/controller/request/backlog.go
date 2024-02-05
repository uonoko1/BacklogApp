package request

type TaskMaterials struct {
	IssueTitle       string   `json:"issueTitle"`
	IssueDescription string   `json:"issueDescription"`
	ExistingComments []string `json:"existingComments"`
	UserName         string   `json:"userName"`
}

type Comment struct {
	TaskId  string `json:"taskId"`
	Comment string `json:"comment"`
}
