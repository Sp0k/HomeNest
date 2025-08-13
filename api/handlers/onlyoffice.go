package handlers

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"mime"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"

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
	rel = strings.TrimPrefix(rel, "/")
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
		"width":        "100%",
		"height":       "100%",
		"editorConfig": map[string]any{
			"mode":        map[bool]string{true: "edit", false: "view"}[strings.ToLower(req.Mode) != "view"],
			"callbackUrl": callbackURL,
			"customization": map[string]any{
				"autosave": true,
				"forcesave": true,
			},
		},
		"permissions": map[string]any{
			"edit":     strings.ToLower(req.Mode) != "view",
			"download": true,
			"chat":     true,
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
	rel = strings.TrimPrefix(rel, "/")
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
		_, _ = f.Seek(0, io.SeekStart)
		ctype = http.DetectContentType(buf[:n])
	}
	w.Header().Set("Content-Type", ctype)
	w.Header().Set("Content-Disposition", fmt.Sprintf(`inline; filename="%s"`, filepath.Base(abs)))
	w.Header().Set("Cache-Control", "private, no-cache, no-store")
	// Let DS read the file bytes
	http.ServeContent(w, r, filepath.Base(abs), fi.ModTime(), f)
}

// POST /api/onlyoffice/callback?path=...
func (s *Server) OnlyOfficeCallbackHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	target := r.URL.Query().Get("path")
	if target == "" {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"error":0}`))
		return
	}

	// small JSON cap & content-type check
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20) // 1 MB
	if ct := r.Header.Get("Content-Type"); !strings.HasPrefix(ct, "application/json") {
		http.Error(w, `{"error":1,"msg":"unsupported media type"}`, http.StatusUnsupportedMediaType)
		return
	}

	// Payload may be open JSON or wrapped in {"token": "<jwt>"} when JWT is enabled
	type cbPayload struct {
		Status     int    `json:"status"`
		Url        string `json:"url"`
		ChangesURL string `json:"changesurl"`
		FileType   string `json:"filetype"`
	}

	var cb cbPayload
	raw, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, `{"error":1,"msg":"bad payload"}`, http.StatusBadRequest)
		return
	}
	secret := os.Getenv(env.OnlyOfficeJWTSecret)
	if secret != "" {
		var wrap struct{ Token string `json:"token"` }
		if err := json.Unmarshal(raw, &wrap); err != nil || wrap.Token == "" {
			http.Error(w, `{"error":1,"msg":"missing token"}`, http.StatusUnauthorized)
			return
		}
		tok, err := jwt.Parse(wrap.Token, func(t *jwt.Token) (any, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method")
			}
			return []byte(secret), nil
		})
		if err != nil || !tok.Valid {
			http.Error(w, `{"error":1,"msg":"invalid token"}`, http.StatusUnauthorized)
			return
		}
		claims, _ := tok.Claims.(jwt.MapClaims)
		// Some DS builds nest the body under a "payload" claim.
		src := claims
		if p, ok := claims["payload"]; ok {
			if m, ok2 := p.(map[string]any); ok2 {
				src = jwt.MapClaims(m)
			}
		}
		buf, _ := json.Marshal(src)
		if err := json.Unmarshal(buf, &cb); err != nil {
			http.Error(w, `{"error":1,"msg":"bad token payload"}`, http.StatusBadRequest)
			return
		}
	} else {
		if err := json.Unmarshal(raw, &cb); err != nil {
			http.Error(w, `{"error":1,"msg":"bad payload"}`, http.StatusBadRequest)
			return
		}
	}

	log.Printf("[onlyoffice] callback: path=%q status=%d url=%q", target, cb.Status, cb.Url)

	// Only save on statuses 2 (MustSave), 6 (MustForceSave), 7 (Corrupted-then-save)
	if cb.Status != 2 && cb.Status != 6 && cb.Status != 7 {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"error":0}`))
		return
	}

	// ----- Normalize & secure target path -----
	rel := filepath.Clean(target)
	rel = strings.TrimPrefix(rel, "/") // ensure relative
	abs := filepath.Join(s.BaseDir, rel)
	if rel2, err := filepath.Rel(s.BaseDir, abs); err != nil || strings.HasPrefix(rel2, "..") {
		http.Error(w, `{"error":1,"msg":"forbidden"}`, http.StatusForbidden)
		return
	}
	log.Printf("[onlyoffice] save -> abs=%s (BaseDir=%s, rel=%s)", abs, s.BaseDir, rel)

	// ----- Validate cb.Url origin (accept external OR internal DS base) -----
	dsExternal := strings.TrimRight(os.Getenv(env.OnlyOfficeURL), "/")         // e.g. http://localhost:8080
	dsInternal := strings.TrimRight(os.Getenv("ONLYOFFICE_URL_INTERNAL"), "/") // e.g. http://documentserver
	if dsExternal == "" && dsInternal == "" {
		http.Error(w, `{"error":1,"msg":"ONLYOFFICE_URL[_INTERNAL] not set"}`, http.StatusInternalServerError)
		return
	}
	u, err := url.Parse(cb.Url)
	if err != nil {
		http.Error(w, `{"error":1,"msg":"bad upstream url"}`, http.StatusBadRequest)
		return
	}
	hasAllowedBase := (dsExternal != "" && strings.HasPrefix(cb.Url, dsExternal+"/")) ||
	(dsInternal != "" && strings.HasPrefix(cb.Url, dsInternal+"/"))
	if !hasAllowedBase {
		log.Printf("OnlyOffice: upstream url %q not matching bases ext=%q int=%q", cb.Url, dsExternal, dsInternal)
		http.Error(w, `{"error":1,"msg":"bad upstream base"}`, http.StatusBadRequest)
		return
	}

	// ----- Build internal fetch URL (prefer internal for container-to-container) -----
	fetchURL := cb.Url
	if dsInternal != "" {
		u.Scheme, u.Host = mustParse(dsInternal)
		fetchURL = u.String()
	}
	log.Printf("[onlyoffice] fetchURL=%s", fetchURL)

	// ----- Get updated file from DS (with JWT Auth & timeout) -----
	authTok, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"payload": map[string]any{},
	}).SignedString([]byte(secret))

	client := &http.Client{Timeout: 15 * time.Second}
	req2, _ := http.NewRequest("GET", fetchURL, nil)
	req2.Header.Set("Authorization", "Bearer "+authTok)

	resp, err := client.Do(req2)
	if err != nil || resp.StatusCode != http.StatusOK {
		if resp != nil {
			resp.Body.Close()
		}
		http.Error(w, `{"error":1,"msg":"pull failed"}`, http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	// Optional soft size cap (tune or remove)
	if resp.ContentLength > 0 && resp.ContentLength > 100<<20 { // 100 MB
		http.Error(w, `{"error":1,"msg":"file too large"}`, http.StatusRequestEntityTooLarge)
		return
	}

	// ----- (Optional) Validate DOCX/ZIP header to avoid saving HTML/JSON by accident -----
	isZipHeader := func(b []byte) bool {
		return len(b) >= 4 && b[0] == 'P' && b[1] == 'K' && b[2] == 3 && b[3] == 4
	}

	// Read first 4 bytes
	head := make([]byte, 4)
	if _, err := io.ReadFull(resp.Body, head); err != nil {
		http.Error(w, `{"error":1,"msg":"upstream read failed"}`, http.StatusBadGateway)
		return
	}
	if !isZipHeader(head) {
		// avoid corrupting the host file
		http.Error(w, `{"error":1,"msg":"invalid file from DS"}`, http.StatusBadGateway)
		return
	}

	// ----- Write atomically (tmp -> rename) -----
	tmp := abs + ".tmp"
	out, err := os.Create(tmp)
	if err != nil {
		http.Error(w, `{"error":1,"msg":"write failed"}`, http.StatusInternalServerError)
		return
	}
	// write the 4 bytes we already read
	if _, err := out.Write(head); err != nil {
		out.Close()
		_ = os.Remove(tmp)
		http.Error(w, `{"error":1,"msg":"write failed"}`, http.StatusInternalServerError)
		return
	}
	// stream the rest
	if _, err := io.Copy(out, resp.Body); err != nil {
		out.Close()
		_ = os.Remove(tmp)
		http.Error(w, `{"error":1,"msg":"write failed"}`, http.StatusInternalServerError)
		return
	}
	out.Close()

	if err := os.Rename(tmp, abs); err != nil {
		http.Error(w, `{"error":1,"msg":"rename failed"}`, http.StatusInternalServerError)
		return
	}

	// Success
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(`{"error":0}`))
}

// mustParse splits scheme://host from a base URL; panics only if misconfigured
func mustParse(base string) (scheme, host string) {
	u, err := url.Parse(base)
	if err != nil || u.Scheme == "" || u.Host == "" {
		panic("ONLYOFFICE_URL_INTERNAL is invalid: " + base)
	}
	return u.Scheme, u.Host
}

