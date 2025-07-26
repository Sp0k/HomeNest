package handlers

import (
  "encoding/json"
  "io"
  "net/http"
  "os"
  "path/filepath"
  "strings"
)

const uploadLimit = 500 << 20 // 500 MiB

func UploadFileHandler(w http.ResponseWriter, r *http.Request) {
  r.Body = http.MaxBytesReader(w, r.Body, uploadLimit)
  if err := r.ParseMultipartForm(uploadLimit); err != nil {
    http.Error(w, "Could not parse multipart form: "+err.Error(), http.StatusBadRequest)
    return
  }

  parent := r.FormValue("parentPath")
  cleanParent := filepath.Clean(parent)
  if cleanParent == "." || strings.Contains(cleanParent, "..") {
    http.Error(w, "Invalid parent path", http.StatusBadRequest)
    return
  }

  var saved []string
  for _, fhs := range r.MultipartForm.File {
    for _, fh := range fhs {
      in, err := fh.Open()
      if err != nil {
        http.Error(w, "Failed to open upload: "+err.Error(), http.StatusBadRequest)
        return
      }

      rel := filepath.Clean(fh.Filename)
      if strings.HasPrefix(rel, ".."+string(filepath.Separator)) || rel == ".." {
        in.Close()
        http.Error(w, "Invalid file path in upload", http.StatusBadRequest)
        return
      }

      dstPath := filepath.Join(BaseDir, cleanParent, rel)
      if err := os.MkdirAll(filepath.Dir(dstPath), 0755); err != nil {
        in.Close()
        http.Error(w, "Could not create folder: "+err.Error(), http.StatusInternalServerError)
        return
      }

      out, err := os.Create(dstPath)
      if err != nil {
        in.Close()
        http.Error(w, "Could not create file: "+err.Error(), http.StatusInternalServerError)
        return
      }

      if _, err := io.Copy(out, in); err != nil {
        in.Close()
        out.Close()
        http.Error(w, "Failed to write file: "+err.Error(), http.StatusInternalServerError)
        return
      }

      in.Close()
      out.Close()

      saved = append(saved, filepath.ToSlash(filepath.Join(cleanParent, rel)))
    }
  }

  w.Header().Set("Content-Type", "application/json")
  w.WriteHeader(http.StatusCreated)
  json.NewEncoder(w).Encode(map[string]interface{}{
    "message": "Upload complete",
    "files":   saved,
  })
}

