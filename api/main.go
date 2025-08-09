package main

import (
  "log"
  "net/http"

  "github.com/gorilla/mux"
	"github.com/gorilla/handlers"
	"github.com/joho/godotenv"

	env "github.com/Sp0k/HomeNest/api/environment"
	nest "github.com/Sp0k/HomeNest/api/handlers"
)

func main() {
	_ = godotenv.Load(".env") // OK if missing (Docker/production)

	baseDir := env.ResolveRootDir()
	srv, err := nest.NewServer(baseDir)
	if err != nil { log.Fatalf("%v", err) }

	r := mux.NewRouter()

	r.HandleFunc("/api/createFolder", srv.CreateFolderHandler).Methods("POST")
	r.HandleFunc("/api/getFolders", srv.GetFoldersHandler).Methods("GET")
	r.HandleFunc("/api/getFiles", srv.GetFilesHandler).Methods("GET")
	r.HandleFunc("/api/createFile", srv.CreateFileHandler).Methods("POST")
	r.HandleFunc("/api/upload", srv.UploadFileHandler).Methods("POST")
	r.HandleFunc("/api/download", srv.DownloadHandler).Methods("GET")
	r.HandleFunc("/api/rename", srv.RenameItemHandler).Methods("POST")
	r.HandleFunc("/api/delete", srv.DeleteItemHandler).Methods("DELETE")
	r.HandleFunc("/api/move", srv.MoveHandler).Methods("POST")

	// CORS origins from env (comma-separated), with sensible defaults for dev
	defaultOrigins := []string{
		"http://localhost:5173", "http://127.0.0.1:5173", // Vite
		"http://localhost:3000", "http://127.0.0.1:3000", // CRA (if you use it)
		"http://localhost:8080", "http://127.0.0.1:8080", // OnlyOffice DS or API (dev)
	}
	origins := env.SplitCSVEnv(env.AllowedOrigins, defaultOrigins)

	corsOpts := handlers.CORS(
		handlers.AllowedOrigins(origins),
		handlers.AllowedMethods([]string{"GET", "POST", "DELETE", "PUT", "OPTIONS"}),
		handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
	)

	log.Println("API listening on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", corsOpts(r)))
}
