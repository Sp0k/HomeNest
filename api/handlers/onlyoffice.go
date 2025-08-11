package handlers

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"
	"mime"

	"github.com/golang-jwt/jwt/v5"

	env "github.com/Sp0k/HomeNest/api/environment"
)

type onlyofficeConfigReq struct {
	Path string `json:"path"`
	Mode string `json:"mode"`
}

func docTypeForExt(ext string) string {
	e := strings.ToLower(ext)
	switch e {
	case ".docx", ".doc", ".odt", ".rtf", ".txt", ".html", ".docxf":
		return "text"
	case ".xlsx", ".xls", ".ods", ".csv":
		return "spreadsheet"
	case ".pptx", ".ppt", ".odp":
		return "presentation"
	default:
		return "text"
	}
}

func stableKey(abs string, fi os.FileInfo) string {
	h := sha256.Sum256([]byte(abs + fi.ModTime().UTC().Format(time.RFC3339Nano)))
	return hex.EncodeToString(h[:])
}

func (s *Server) baseURLForExternal(r *http.Request) string {
	// Prefer explicit env (works in Docker compose: http://api:8081)
	if v := os.Getenv(env.ApiPublicUrl); v != "" {
		return strings.TrimRight(v, "/")
	}
	// Fallback to request host (works in local go run):
	scheme := "http"
	if r.TLS != nil {
		scheme = "https"
	}
	return fmt.Sprintf("%s://%s", scheme, r.Host)
}

// POST /api/onlyoffice/config
func (s *Server) OnlyOfficeConfigHandler(w http.ResponseWriter, r *http.Request) {
	var req onlyofficeConfigReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "bad payload", http.StatusBadRequest)
		return
	}
	rel := filepath.Clean("/" + req.Path)
	abs := filepath.Join(s.BaseDir, rel)

	if rel2, err := filepath.Rel(s.BaseDir, abs); err != nil || strings.HasPrefix(rel2, "..") {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	fi, err := os.Stat(abs)
	if err != nil || fi.IsDir() {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	secret := os.Getenv(env.OnlyOfficeJWTSecret)
	base := s.baseURLForExternal(r)

	// short-lived signed download URL (DS will GET this)
	dlClaims := jwt.MapClaims{
		"path": req.Path,
		"exp":  time.Now().Add(10 * time.Minute).Unix(),
	}
	dlSig, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, dlClaims).SignedString([]byte(secret))
	downloadURL := base + "/api/files?path=" + url.QueryEscape(req.Path) + "&sig=" + url.QueryEscape(dlSig)

	// callback (DS will POST here on save), include ?path so we know which file
	callbackURL := base + "/api/onlyoffice/callback?path=" + url.QueryEscape(req.Path)

	ext := strings.TrimPrefix(strings.ToLower(filepath.Ext(abs)), ".")
	unsignedCfg := map[string]any{
		"document": map[string]any{
			"fileType": ext,
			"title":    filepath.Base(abs),
			"key":      stableKey(abs, fi),
			"url":      downloadURL,
		},
		"documentType": docTypeForExt(filepath.Ext(abs)),
		"width":  "100%",
		"height": "100%",
		"editorConfig": map[string]any{
			"mode":        map[bool]string{true: "edit", false: "view"}[strings.ToLower(req.Mode) != "view"],
			"callbackUrl": callbackURL,
			"customization": map[string]any{
				"autosave": true,
			},
		},
		"permissions": map[string]any{
			"edit":     strings.ToLower(req.Mode) != "view",
			"download": true,
			"chat": 		true,
		},
	}


	// Sign the *config itself* (no "payload" wrapper)
	tokenStr, err := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims(unsignedCfg)).
		SignedString([]byte(secret))
	if err != nil {
		http.Error(w, "sign error", http.StatusInternalServerError)
		return
	}

	// attach the token and send
	unsignedCfg["token"] = tokenStr

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(unsignedCfg)
}

// GET /api/files?path=...&sig=...
func (s *Server) FilesDownloadHandler(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Query().Get("path")
	sig := r.URL.Query().Get("sig")
	secret := os.Getenv(env.OnlyOfficeJWTSecret)
	// verify sig
	_, err := jwt.Parse(sig, func(t *jwt.Token) (any, error) { return []byte(secret), nil })
	if err != nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	rel := filepath.Clean("/" + path)
	abs := filepath.Join(s.BaseDir, rel)

	if rel2, err := filepath.Rel(s.BaseDir, abs); err != nil || strings.HasPrefix(rel2, "..") {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	f, err := os.Open(abs)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	defer f.Close()
	fi, _ := f.Stat()

	ctype := mime.TypeByExtension(strings.ToLower(filepath.Ext(abs)))
	if ctype == "" {
		buf := make([]byte, 512)
		n, _ := f.Read(buf)
		f.Seek(0, io.SeekStart)
		ctype = http.DetectContentType(buf[:n])
	}
	w.Header().Set("Content-Type", ctype)
	w.Header().Set("Content-Disposition", fmt.Sprintf(`inline; filename="%s"`, filepath.Base(abs)))
	w.Header().Set("Cache-Control", "private, no-cache, no-store")
	// Let DS read the file bytes
	http.ServeContent(w, r, filepath.Base(abs), fi.ModTime(), f)
}

type onlyofficeCallback struct {
	Status int    `json:"status"`
	Url    string `json:"url"` // DS gives URL to updated file
}

// POST /api/onlyoffice/callback?path=...
func (s *Server) OnlyOfficeCallbackHandler(w http.ResponseWriter, r *http.Request) {
	target := r.URL.Query().Get("path")
	w.Header().Set("Content-Type", "application/json")

	if target == "" {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"error":0}`))
		return
	}

	// tiny JSON cap & content-type check
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20) // 1 MB
	if ct := r.Header.Get("Content-Type"); !strings.HasPrefix(ct, "application/json") {
		http.Error(w, `{"error":1,"msg":"unsupported media type"}`, http.StatusUnsupportedMediaType)
		return
	}

	var cb onlyofficeCallback
	if err := json.NewDecoder(r.Body).Decode(&cb); err != nil {
		http.Error(w, `{"error":1,"msg":"bad payload"}`, http.StatusBadRequest)
		return
	}

	// Only save on statuses 2, 6, 7
	if cb.Status != 2 && cb.Status != 6 && cb.Status != 7 {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"error":0}`))
		return
	}

	// Path safety: stay under BaseDir
	rel := filepath.Clean("/" + target)
	abs := filepath.Join(s.BaseDir, rel)
	if rel2, err := filepath.Rel(s.BaseDir, abs); err != nil || strings.HasPrefix(rel2, "..") {
		http.Error(w, `{"error":1,"msg":"forbidden"}`, http.StatusForbidden)
		return
	}

	// Verify updated file URL comes from YOUR Document Server
	dsBase := strings.TrimRight(os.Getenv(env.OnlyOfficeURL), "/") // e.g. http://docs:80 or https://docs.example.com
	if dsBase == "" {
		http.Error(w, `{"error":1,"msg":"ONLYOFFICE_URL not set"}`, http.StatusInternalServerError)
		return
	}
	u, err := url.Parse(cb.Url)
	if err != nil || !strings.HasPrefix(cb.Url, dsBase+"/") {
		http.Error(w, `{"error":1,"msg":"bad upstream"}`, http.StatusBadRequest)
		return
	}

	// Fetch updated file with timeout and soft size guard
	secret := os.Getenv(env.OnlyOfficeJWTSecret)
	authTok, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"payload": map[string]any{},
	}).SignedString([]byte(secret))

	client := &http.Client{Timeout: 15 * time.Second}
	req, _ := http.NewRequest("GET", u.String(), nil)
	req.Header.Set("Authorization", "Bearer "+authTok)

	resp, err := client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		if resp != nil { resp.Body.Close() }
		http.Error(w, `{"error":1,"msg":"pull failed"}`, http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	// Optional soft cap (tune or remove as you wish)
	if resp.ContentLength > 0 && resp.ContentLength > 100<<20 { // 100 MB
		http.Error(w, `{"error":1,"msg":"file too large"}`, http.StatusRequestEntityTooLarge)
		return
	}

	tmp := abs + ".tmp"
	out, err := os.Create(tmp)
	if err != nil {
		http.Error(w, `{"error":1,"msg":"write failed"}`, http.StatusInternalServerError)
		return
	}
	if _, err := io.Copy(out, resp.Body); err != nil {
		out.Close()
		_ = os.Remove(tmp)
		http.Error(w, `{"error":1,"msg":"write failed"}`, http.StatusInternalServerError)
		return
	}
	out.Close()
	_ = os.Rename(tmp, abs)

	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(`{"error":0}`))
}

