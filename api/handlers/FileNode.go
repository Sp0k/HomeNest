package handlers

import (
	"time"
)

// FileNode is what we send back to the client to represent a file or folder.
type FileNode struct {
	Name string `json:"name"`
	Path string `json:"path"` // relative to BaseDir, with forward‑slashes
	IsDir bool `json:"isDir"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	LastAccessed *time.Time `json:"lastAccessed"`
	CreatedBy string `json:"createdBy"`
}
