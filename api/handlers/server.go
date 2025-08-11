package handlers

import (
	"fmt"
	"log"
	"os"

	env "github.com/Sp0k/HomeNest/api/environment"
)

type Server struct {
	BaseDir string
}

func NewServer(baseDir string) (*Server, error) {
	expanded := env.ExpandPath(baseDir)
	if err := os.MkdirAll(expanded, 0755); err != nil {
		return nil, fmt.Errorf(
			"failed to create ROOT_DIR at %s: %w\nTip: set ROOT_DIR to a writable path like ~/HomeNest or ~/Documents/HomeNest in .env",
			expanded, err,
		)
	}
	log.Printf("Using ROOT_DIR: %s", expanded)
	return &Server{BaseDir: expanded}, nil
}

