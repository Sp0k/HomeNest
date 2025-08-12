package handlers

import (
	"fmt"
	"log"
	"net/http"
	"strings"
)

func (s *Server) DocbuilderScript(w http.ResponseWriter, r *http.Request) {
	name := strings.TrimPrefix(r.URL.Path, "/assets/docbuilder/")
	// strip any query just in case
	if i := strings.IndexByte(name, '?'); i >= 0 {
		name = name[:i]
	}
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")

	switch name {
	case "new.docx.docbuilder":
		fmt.Fprint(w, `
builder.CreateFile("docx");
var doc = Api.GetDocument();
builder.SaveFile("docx", "blank.docx");
builder.CloseFile();
`)
	case "new.xlsx.docbuilder":
		fmt.Fprint(w, `
builder.CreateFile("xlsx");
var wb = Api.GetWorkbook();
builder.SaveFile("xlsx", "blank.xlsx");
builder.CloseFile();
`)
	case "new.pptx.docbuilder":
		fmt.Fprint(w, `
builder.CreateFile("pptx");
var p = Api.GetPresentation();
builder.SaveFile("pptx", "blank.pptx");
builder.CloseFile();
`)
	default:
		log.Printf("[docbuilder] 404 for script %q", name)
		http.Error(w, "not found", http.StatusNotFound)
	}
}

