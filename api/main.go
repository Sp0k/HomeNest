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
	_ = godotenv.Load("../.env", ".env") // OK if missing (Docker/production)

	baseDir := env.ResolveRootDir()
	srv, err := nest.NewServer(baseDir)
	if err != nil { log.Fatalf("%v", err) }

	r := mux.NewRouter()
	r.PathPrefix("/assets/docbuilder").HandlerFunc(srv.DocbuilderScript).Methods("GET", "HEAD")

	api := r.PathPrefix("/api").Subrouter()

	api.HandleFunc("/createFolder", srv.CreateFolderHandler).Methods("POST")
	api.HandleFunc("/getFolders", srv.GetFoldersHandler).Methods("GET")
	api.HandleFunc("/getFiles", srv.GetFilesHandler).Methods("GET")
	api.HandleFunc("/createFile", srv.CreateFileHandler).Methods("POST")
	api.HandleFunc("/upload", srv.UploadFileHandler).Methods("POST")
	api.HandleFunc("/download", srv.DownloadHandler).Methods("GET")
	api.HandleFunc("/rename", srv.RenameItemHandler).Methods("POST")
	api.HandleFunc("/delete", srv.DeleteItemHandler).Methods("DELETE")
	api.HandleFunc("/move", srv.MoveHandler).Methods("POST")
	api.HandleFunc("/onlyoffice/config", srv.OnlyOfficeConfigHandler).Methods("POST")
	api.HandleFunc("/onlyoffice/callback", srv.OnlyOfficeCallbackHandler).Methods("POST")
	api.HandleFunc("/files", srv.FilesDownloadHandler).Methods("GET")
	api.HandleFunc("/onlyoffice/createFile", srv.OnlyOfficeCreateFile).Methods("POST")

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

	log.Println("API listening on http://localhost:8081")
	log.Printf("Using ROOT_DIR: %s", srv.BaseDir)
	log.Fatal(http.ListenAndServe(":8081", corsOpts(r)))
}
