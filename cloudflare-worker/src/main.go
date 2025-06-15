package main

import (
	"encoding/json"
	"syscall/js"
)

// Response represents a standard API response
type Response struct {
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Status  string      `json:"status"`
}

func main() {
	// Register API functions
	js.Global().Set("handleRequest", js.FuncOf(handleRequest))
	// Keep the worker running
	select {}
}

// handleRequest processes API requests and returns JSON responses
func handleRequest(this js.Value, args []js.Value) interface{} {
	// Create a promise to handle the async response
	handler := js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		resolve := args[0]
		reject := args[1]

		// Get the request path from the first argument
		path := args[0].String()

		var response Response

		// Route based on path
		switch path {
		case "/test":
			response = Response{
				Message: "Backend API is running successfully!",
				Status:  "healthy",
				Data: map[string]interface{}{
					"version":  "1.0.0",
					"platform": "Cloudflare Workers + Go/WASM",
				},
			}
		case "/hello":
			response = Response{
				Message: "Hello from Go/WASM!",
				Status:  "success",
				Data: map[string]interface{}{
					"greeting": "Hello, World!",
				},
			}
		default:
			response = Response{
				Message: "Endpoint not found",
				Status:  "error",
				Data: map[string]interface{}{
					"path": path,
				},
			}
		}

		// Convert to JSON
		jsonData, err := json.Marshal(response)
		if err != nil {
			reject.Invoke(js.Global().Get("Error").New(err.Error()))
			return nil
		}

		// Resolve with the JSON response
		resolve.Invoke(string(jsonData))
		return nil
	})

	// Create and return the promise
	promiseConstructor := js.Global().Get("Promise")
	return promiseConstructor.New(handler)
}
