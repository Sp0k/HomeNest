package environment

import (
	"log"
	"os"
	"path/filepath"
	"runtime"
	"strings"
)

const (
	RootDir             = "ROOT_DIR"
	OnlyOfficeJWTSecret = "ONLYOFFICE_JWT_SECRET"
	ApiPublicUrl        = "API_PUBLIC_URL"
	AllowedOrigins      = "ALLOWED_ORIGINS"
)

// ExpandPath expands "~", $HOME, and turns relative into absolute (under $HOME)
func ExpandPath(p string) string {
	p = strings.TrimSpace(p)
	if p == "" {
		return p
	}
	home, _ := os.UserHomeDir()

	// env-style expansions
	p = strings.ReplaceAll(p, "$HOME", home)
	p = strings.ReplaceAll(p, "${HOME}", home)
	if runtime.GOOS == "windows" {
		if up := os.Getenv("USERPROFILE"); up != "" {
			p = strings.ReplaceAll(p, "%USERPROFILE%", up)
		}
	}
	// ~ expansion
	if strings.HasPrefix(p, "~") {
		p = filepath.Join(home, strings.TrimPrefix(p, "~"))
	}
	// relative -> $HOME/relative
	if !filepath.IsAbs(p) {
		p = filepath.Join(home, p)
	}
	return filepath.Clean(p)
}

// Resolve a usable root dir (fallback: ~/HomeNest)
func ResolveRootDir() string {
	if v := os.Getenv(RootDir); v != "" {
		return ExpandPath(v)
	}
	home, err := os.UserHomeDir()
	if err != nil {
		log.Fatalf("Could not get home directory: %v", err)
	}
	return filepath.Join(home, "HomeNest")
}

// Parse comma-separated env list (trims spaces, drops empties)
func SplitCSVEnv(key string, def []string) []string {
	v := os.Getenv(key)
	if v == "" {
		return def
	}
	parts := strings.Split(v, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if s := strings.TrimSpace(p); s != "" {
			out = append(out, s)
		}
	}
	return out
}
