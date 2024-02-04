package request

type TaskMaterials struct {
	IssueTitle       string   `json:"issueTitle"`
	IssueDescription string   `json:"issueDescription"`
	ExistingComments []string `json:"existingComments"`
}

type Comment struct {
	TaskId  string `json:"taskId"`
	Comment string `json:"comment"`
}
