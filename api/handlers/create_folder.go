package handlers

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// CreateFolderRequest is the JSON payload we expect from the client.
type CreateFolderRequest struct {
	ParentPath string `json:"parentPath"`
	FolderName string `json:"folderName"`
}

// CreateFolderHandler handles POST /api/createFolder
func (s *Server) CreateFolderHandler(w http.ResponseWriter, r *http.Request) {
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

	fullPath := filepath.Join(s.BaseDir, cleanParent, req.FolderName)

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
