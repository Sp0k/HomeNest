package main

import (
  "log"
  "net/http"

  "github.com/gorilla/mux"
	"github.com/gorilla/handlers"

	nest "github.com/Sp0k/HomeNest/api/handlers"
)

func main() {
	r := mux.NewRouter()

	r.HandleFunc("/api/createFolder", nest.CreateFolderHandler).Methods("POST")
	r.HandleFunc("/api/getFolders", nest.GetFoldersHandler).Methods("GET")
	r.HandleFunc("/api/getFiles", nest.GetFilesHandler).Methods("GET")
	r.HandleFunc("/api/createFile", nest.CreateFileHandler).Methods("POST")
	r.HandleFunc("/api/upload", nest.UploadFileHandler).Methods("POST")
	r.HandleFunc("/api/download", nest.DownloadHandler).Methods("GET")

	corsOpts := handlers.CORS(
		handlers.AllowedOrigins([]string{"http://localhost:3000"}),
		handlers.AllowedMethods([]string{"GET", "POST", "DELETE", "PUT", "OPTIONS"}),
		handlers.AllowedHeaders([]string{"Content-type"}),
	)

	log.Println("API listening on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", corsOpts(r)))
}
