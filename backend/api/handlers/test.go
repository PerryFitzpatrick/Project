package handlers

import (
	"encoding/json"
	"net/http"
)

type testResponse struct {
	Message string `json:"message"`
	Status  string `json:"status"`
	Version string `json:"version"`
}

func HandleTest() func(w http.ResponseWriter, _ *http.Request) {
	return func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		res := testResponse{
			Message: "Backend API is running successfully!",
			Status:  "healthy",
			Version: "1.0.0",
		}

		json.NewEncoder(w).Encode(res)
	}
}
