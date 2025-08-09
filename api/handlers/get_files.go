package handlers

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

var ignoreNames = []string{
	".DS_Store",
	"Desktop.ini",
	"Thumbs.db",
	".directory",
}

func isDirectoryFile(fileName string) bool {
	for _, name := range ignoreNames {
		if strings.Compare(fileName, name) == 0 {
			return true
		}
	}
	return false
}

func (s *Server) GetFilesHandler(w http.ResponseWriter, r *http.Request) {
	raw := r.URL.Query().Get("path")
	if raw == "" {
		raw = "/"
	}

	cleanParent := filepath.Clean(raw)
	if strings.Contains(cleanParent, "..") {
		http.Error(w, "Invalid parent path", http.StatusBadRequest)
		return
	}

	fullPath := filepath.Join(s.BaseDir, cleanParent)

	entries, err := os.ReadDir(fullPath)
	if err != nil {
		http.Error(w, "Could not read folder: "+err.Error(), http.StatusInternalServerError)
		return
	}

	var nodes []FileNode
	for _, entry := range entries {
		if entry.IsDir() || isDirectoryFile(entry.Name()) {
			continue
		}
		info, err := entry.Info()
		if err != nil {
			continue
		}

		rel := filepath.Join(cleanParent, entry.Name())

		nodes = append(nodes, FileNode{
			Name: entry.Name(),
			Path: filepath.ToSlash(rel),
			IsDir: false,
			CreatedAt: info.ModTime(),
			UpdatedAt: info.ModTime(),
			LastAccessed: nil,
			CreatedBy: "",
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(nodes)
}
