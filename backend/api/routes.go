package api

import (
	"api-template/api/handlers"
	"net/http"

	"github.com/go-chi/chi/v5"
)

const (
	routeFoo     = "/foo"
	routeHello   = "/hello"
	routeTest    = "/test"
	routeMetrics = "/metrics"
	routeEmail   = "/email"
)

func (a *App) createRoutes(router *chi.Mux) {
	// Add CORS middleware
	router.Use(a.corsMiddleware)

	router.Get(routeMetrics, handlers.HandleMetrics(a.metrics.Registry))
	router.Get(routeHello, handlers.HandleHello())
	router.Get(routeFoo, handlers.HandleFoo(a.metrics))
	router.Get(routeTest, handlers.HandleTest())
	router.Post(routeEmail, handlers.HandleSendEmail(a.logger))
}

// corsMiddleware adds CORS headers to all responses
func (a *App) corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
