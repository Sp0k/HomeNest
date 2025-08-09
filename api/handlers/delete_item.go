package handlers

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

func (s *Server) DeleteItemHandler(w http.ResponseWriter, r *http.Request) {
	p := r.URL.Query().Get("path")
	clean := filepath.Clean(p)
	if strings.Contains(clean, "..") {
		http.Error(w, "Invalid path", http.StatusBadRequest)
		return
	}

	abs := filepath.Join(s.BaseDir, clean)

	info, err := os.Stat(abs)
	if (err != nil) {
		http.Error(w, "Not Found", http.StatusNotFound)
		return
	}

	if info.IsDir() {
		err = os.RemoveAll(abs)
	} else {
		err = os.Remove(abs)
	}
	if err != nil {
		http.Error(w, "Could not delete", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
