package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
)

type MoveRequest struct {
	SourcePath string `json:"sourcePath"`
	DestPath 	 string `json:"destPath"`
}

func MoveHandler(w http.ResponseWriter, r *http.Request) {
	var req MoveRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request payload", http.StatusBadRequest)
		return
	}

	srcFull := filepath.Join(BaseDir, filepath.Clean(req.SourcePath))
	destDir := filepath.Join(BaseDir, filepath.Clean(req.DestPath))

	info, err := os.Stat(destDir)
	if err != nil {
		http.Error(w, "destination not found", http.StatusBadRequest)
		return
	}
	if !info.IsDir() {
		http.Error(w, "destination is not a folder", http.StatusBadRequest)
		return
	}

	newFull := filepath.Join(destDir, filepath.Base(srcFull))

	if err := os.Rename(srcFull, newFull); err != nil {
		msg := fmt.Sprintf("could not move item: %v", err)
		http.Error(w, msg, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
