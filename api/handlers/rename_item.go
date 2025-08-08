package handlers

import (
	"os"
	"net/http"
	"path/filepath"
	"encoding/json"
	"strings"
)

type RenameItemRequest struct {
	ParentPath string `json:"parentPath"`
	CurrName string `json:"currentName"`
	NewName string `json:"newName"`
	Type string `json:"type"`
}

func RenameItemHandler(w http.ResponseWriter, r *http.Request) {
	var req RenameItemRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}

	cleanParent := filepath.Clean(req.ParentPath)
	if filepath.IsAbs(cleanParent) {
		cleanParent = strings.TrimPrefix(cleanParent, string(filepath.Separator))
	}
	if strings.Contains(cleanParent, "..") {
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}

	newPath := filepath.Join(BaseDir, cleanParent, req.NewName)
	currPath := filepath.Join(BaseDir, cleanParent, req.CurrName)

	if err := os.Rename(currPath, newPath); err != nil {
		http.Error(w, "Could not rename item" + err.Error(), http.StatusInternalServerError)
		return
	}

	info, err := os.Stat(newPath)
	if err != nil {
		http.Error(w, "Renamed, but failed to stat new item", http.StatusInternalServerError)
		return
	}

	node := FileNode{
		Name: req.NewName,
		Path: filepath.ToSlash(filepath.Join(cleanParent, req.NewName)),
		IsDir: info.IsDir(),
		CreatedAt: info.ModTime(),
		UpdatedAt: info.ModTime(),
		LastAccessed: nil,
		CreatedBy: "",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"node": node})
}
