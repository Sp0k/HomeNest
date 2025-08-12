package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type OONewFileReq struct {
	ParentPath string `json:"parentPath"`
	FileName   string `json:"fileName"`
	FileType   string `json:"fileType"` // docx|xlsx|pptx
}
type OONewFileResp struct{ Node FileNode `json:"node"` }

func (s *Server) OnlyOfficeCreateFile(w http.ResponseWriter, r *http.Request) {
	var req OONewFileReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest); return
	}
	ft := strings.ToLower(strings.TrimSpace(req.FileType))
	if ft != "docx" && ft != "xlsx" && ft != "pptx" {
		http.Error(w, "Unsupported OnlyOffice type", http.StatusBadRequest); return
	}
	parent := filepath.Clean(req.ParentPath)
	if strings.Contains(parent, "..") {
		http.Error(w, "Invalid path", http.StatusBadRequest); return
	}

	// internal URLs (container-to-container)
	docserver := strings.TrimRight(os.Getenv("ONLYOFFICE_URL_INTERNAL"), "/")
	if docserver == "" { docserver = "http://documentserver" }
	apiInternal := strings.TrimRight(os.Getenv("API_PUBLIC_URL"), "/")
	if apiInternal == "" { apiInternal = "http://api:8081" }

	// where DS will fetch the .docbuilder script
	scriptURL := fmt.Sprintf("%s/assets/docbuilder/new.%s.docbuilder", apiInternal, ft)

	// build /docbuilder request payload
	payload := map[string]any{"async": false, "url": scriptURL}
	body := payload

	// sign JWT if DS has JWT_ENABLED=true
	if sec := os.Getenv("ONLYOFFICE_JWT_SECRET"); sec != "" {
		tok := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims(payload))
		signed, err := tok.SignedString([]byte(sec))
		if err != nil { http.Error(w, "JWT sign failed", http.StatusInternalServerError); return }
		body = map[string]any{"token": signed}
	}

	b, _ := json.Marshal(body)
	reqURL := docserver + "/docbuilder"
	resp, err := http.Post(reqURL, "application/json", bytes.NewReader(b))
	if err != nil {
		http.Error(w, fmt.Sprintf("docbuilder POST failed to %s: %v", reqURL, err), http.StatusBadGateway); return
	}
	defer resp.Body.Close()
	raw, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != 200 {
		http.Error(w, fmt.Sprintf("docbuilder status %d: %s", resp.StatusCode, string(raw)), http.StatusBadGateway); return
	}

	// expected shape: { "urls": { "blank.docx": "http://.../tmp/....docx" }, "end": true, "error": 0 }
	var br struct {
		Urls  map[string]string `json:"urls"`
		End   bool              `json:"end"`
		Error int               `json:"error"`
	}
	if err := json.Unmarshal(raw, &br); err != nil {
		http.Error(w, fmt.Sprintf("docbuilder bad json: %s", string(raw)), http.StatusBadGateway); return
	}
	if br.Error != 0 || len(br.Urls) == 0 {
		http.Error(w, fmt.Sprintf("docbuilder error %d: %s", br.Error, string(raw)), http.StatusBadGateway); return
	}

	// pick the first generated file URL
	var genURL string
	for _, u := range br.Urls { genURL = u; break }

	// download generated file
	fileResp, err := http.Get(genURL)
	if err != nil { http.Error(w, fmt.Sprintf("download failed: %v", err), http.StatusBadGateway); return }
	defer fileResp.Body.Close()
	if fileResp.StatusCode != 200 {
		msg, _ := io.ReadAll(fileResp.Body)
		http.Error(w, fmt.Sprintf("download status %d: %s", fileResp.StatusCode, string(msg)), http.StatusBadGateway); return
	}
	data, _ := io.ReadAll(fileResp.Body)

	// save to storage
	name := strings.TrimSpace(req.FileName)
	if filepath.Ext(name) == "" { name += "." + ft } else {
		name = strings.TrimSuffix(name, filepath.Ext(name)) + "." + ft
	}
	destDir := filepath.Join(s.BaseDir, parent)
	if err := os.MkdirAll(destDir, 0o755); err != nil {
		http.Error(w, "Cannot create destination folder", http.StatusInternalServerError); return
	}
	dest := filepath.Join(destDir, name)
	if err := os.WriteFile(dest, data, 0o644); err != nil {
		http.Error(w, "Cannot write file", http.StatusInternalServerError); return
	}

	now := time.Now().UTC()
	node := FileNode{
		Name: name, Path: filepath.ToSlash(filepath.Join(parent, name)),
		IsDir: false, CreatedAt: now, UpdatedAt: now,
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(OONewFileResp{Node: node})
}

