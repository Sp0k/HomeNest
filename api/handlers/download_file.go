package handlers

import (
	"net/http"
	"path/filepath"
)

func (s *Server) DownloadHandler(w http.ResponseWriter, r *http.Request) {
	p := r.URL.Query().Get("path")

	safe := filepath.Clean(p)
	abs  := filepath.Join(s.BaseDir, safe)

	http.ServeFile(w, r, abs)
}
