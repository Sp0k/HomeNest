package handlers

import (
	"net/http"
	"path/filepath"
)

func DownloadHandler(w http.ResponseWriter, r *http.Request) {
	p := r.URL.Query().Get("path")

	safe := filepath.Clean(p)
	abs  := filepath.Join(BaseDir, safe)

	http.ServeFile(w, r, abs)
}
