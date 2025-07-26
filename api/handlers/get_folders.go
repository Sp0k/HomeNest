package handlers

import (
    "encoding/json"
    "net/http"
    "os"
    "path/filepath"
    "strings"
)

func GetFoldersHandler(w http.ResponseWriter, r *http.Request) {
    // 1️⃣ Read the `?path=` query parameter
    raw := r.URL.Query().Get("path")
    if raw == "" {
        raw = "/"         // default to root
    }

    // 2️⃣ Clean & sanitize
    cleanParent := filepath.Clean(raw)
    if strings.Contains(cleanParent, "..") {
        http.Error(w, "Invalid parent path", http.StatusBadRequest)
        return
    }

    // 3️⃣ Compute on‑disk directory
    fullPath := filepath.Join(BaseDir, cleanParent)

    // 4️⃣ Read the directory
    entries, err := os.ReadDir(fullPath)
    if err != nil {
        http.Error(w, "Could not read folder: "+err.Error(), http.StatusInternalServerError)
        return
    }

    // 5️⃣ Build the response slice
    var nodes []FileNode
    for _, entry := range entries {
        if !entry.IsDir() {
            continue
        }
        info, err := entry.Info()
        if err != nil {
            continue
        }

        // Use the *relative* path here
        rel := filepath.Join(cleanParent, entry.Name())

        nodes = append(nodes, FileNode{
            Name:         entry.Name(),
            Path:         filepath.ToSlash(rel),
            IsDir:        true,
            CreatedAt:    info.ModTime(), // or your own metadata
            UpdatedAt:    info.ModTime(),
            LastAccessed: nil,
            CreatedBy:    "",
        })
    }

    // 6️⃣ Send it back
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(nodes)
}
