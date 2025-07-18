package handlers

import (
    "encoding/json"
    "net/http"
    "os"
    "path/filepath"
    "strings"
    "time"
)

// BaseDir is where all your files/folders live on disk.
var BaseDir string

func init() {
	home, err := os.UserHomeDir()
	if err != nil {
		panic("cannot determine user home directory: " + err.Error())
	}
	// TODO: add an installation process where the user can define their own path
	BaseDir = filepath.Join(home, "Documents", "tests")
}

// CreateFolderRequest is the JSON payload we expect from the client.
type CreateFolderRequest struct {
	ParentPath string `json:"parentPath"`
	FolderName string `json:"folderName"`
}

// FileNode is what we send back to the client to represent a file or folder.
type FileNode struct {
	Name string `json:"name"`
	Path string `json:"path"` // relative to BaseDir, with forward‑slashes
	IsDir bool `json:"isDir"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	LastAccessed *time.Time `json:"lastAccessed"`
	CreatedBy string `json:"createdBy"`
}

// CreateFolderHandler handles POST /api/createFolder
func CreateFolderHandler(w http.ResponseWriter, r *http.Request) {
	var req CreateFolderRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}

	cleanParent := filepath.Clean(req.ParentPath)
	if strings.Contains(cleanParent, "..") {
		http.Error(w, "Invalid parent path", http.StatusBadRequest)
		return
	}

	fullPath := filepath.Join(BaseDir, cleanParent, req.FolderName)

	if err := os.MkdirAll(fullPath, 0755); err != nil {
		http.Error(w, "Could not create folder: " + err.Error(),
			http.StatusInternalServerError)
		return
	}

	now := time.Now().UTC()
	node := FileNode{
		Name: req.FolderName,
		Path: filepath.ToSlash(filepath.Join(cleanParent, req.FolderName)),
		IsDir: true,
		CreatedAt: now,
		UpdatedAt: now,
		LastAccessed: nil,
		CreatedBy: "User", // TODO: Allow users to set a username to assign data creation
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"node": node})
}
