package handlers

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type CreateFileRequest struct {
	ParentPath string `json:"parentPath"`
	FileName string `json:"fileName"`
	FileType string `json:"fileType"`
}

func CreateFileHandler(w http.ResponseWriter, r *http.Request) {
	var req CreateFileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}

	cleanParent := filepath.Clean(req.ParentPath)
	if strings.Contains(cleanParent, "..") {
		http.Error(w, "Invalid parent path", http.StatusBadRequest)
		return
	}

	fullName := req.FileName
	if len(req.FileType) > 1 {
		fullName = strings.Join([]string{req.FileName, req.FileType}, ".")
	}

	fullPath := filepath.Join(BaseDir, cleanParent, fullName)

	if _, err := os.Create(fullPath); err != nil {
		http.Error(w, "Could not create folder: "+err.Error(),
			http.StatusInternalServerError)
		return
	}

	now := time.Now().UTC()
	node := FileNode{
		Name: fullName,
		Path: filepath.ToSlash(filepath.Join(cleanParent, fullName)),
		IsDir: false,
		CreatedAt: now,
		UpdatedAt: now,
		LastAccessed: nil,
		CreatedBy: "",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"node": node})
}
