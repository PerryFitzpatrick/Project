package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
)

type EmailRequest struct {
	Message string `json:"message"`
}

type EmailResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

type PostmarkEmail struct {
	From     string `json:"From"`
	To       string `json:"To"`
	Subject  string `json:"Subject"`
	TextBody string `json:"TextBody"`
	HtmlBody string `json:"HtmlBody"`
}

// HandleSendEmail handles POST requests to send emails via Postmark
func HandleSendEmail(logger *slog.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// Parse request body
		var req EmailRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			logger.Error("Failed to decode request body", "error", err)
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		if req.Message == "" {
			http.Error(w, "Message is required", http.StatusBadRequest)
			return
		}

		// Create Postmark email
		postmarkEmail := PostmarkEmail{
			From:     "perry@fitzpatrick-family.com",
			To:       "perry@fitzpatrick-family.com",
			Subject:  "New message from website",
			TextBody: req.Message,
			HtmlBody: "<p>" + req.Message + "</p>",
		}

		// Convert to JSON
		jsonData, err := json.Marshal(postmarkEmail)
		if err != nil {
			logger.Error("Failed to marshal email data", "error", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		// Create HTTP request to Postmark API
		postmarkURL := "https://api.postmarkapp.com/email"
		httpReq, err := http.NewRequest("POST", postmarkURL, bytes.NewBuffer(jsonData))
		if err != nil {
			logger.Error("Failed to create HTTP request", "error", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		// Set headers
		httpReq.Header.Set("Content-Type", "application/json")
		httpReq.Header.Set("Accept", "application/json")
		httpReq.Header.Set("X-Postmark-Server-Token", "a9648624-7b85-4864-a9c0-2caf12a9eadf")

		// Send request
		client := &http.Client{}
		resp, err := client.Do(httpReq)
		if err != nil {
			logger.Error("Failed to send email", "error", err)
			response := EmailResponse{
				Success: false,
				Message: "Failed to send email: " + err.Error(),
			}
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}
		defer resp.Body.Close()

		// Read response
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			logger.Error("Failed to read response body", "error", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		// Check if email was sent successfully
		if resp.StatusCode != http.StatusOK {
			logger.Error("Postmark API error", "status", resp.StatusCode, "body", string(body))
			response := EmailResponse{
				Success: false,
				Message: fmt.Sprintf("Failed to send email: HTTP %d", resp.StatusCode),
			}
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}

		logger.Info("Email sent successfully", "to", "perry@fitzpatrick-family.com")

		// Return success response
		response := EmailResponse{
			Success: true,
			Message: "Email sent successfully",
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}
}
