package api

import (
	"fmt"
	"log/slog"
	"net/http"
	"os"

	"api-template/api/metrics"
	"api-template/config"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"
)

const appName = "api-template"

type App struct {
	logger  *slog.Logger
	config  *config.Configuration
	metrics *metrics.Client
}

func New(configPath string) *App {
	if configPath == "" {
		configPath = "config.yaml"
	}

	// Load environment variables from .env file
	if err := godotenv.Load(); err != nil {
		// Don't fail if .env file doesn't exist, just log it
		fmt.Println("No .env file found, using system environment variables")
	}

	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))

	return &App{
		logger:  logger,
		config:  config.Configure(configPath),
		metrics: metrics.New(logger),
	}
}

// Start runs the API. It is triggered by the serve command.
func (a *App) Start() {
	r := chi.NewRouter()
	r.Use(chimiddleware.Logger)
	r.Use(a.NewMetricsMiddleware)
	a.createRoutes(r)

	port := fmt.Sprintf(":%d", a.config.Port)
	startupLog := fmt.Sprintf("starting API on port :%d", a.config.Port)
	a.logger.Info(startupLog)
	if err := http.ListenAndServe(port, r); err != nil {
		a.logger.Error("starting the API: ", slog.String("error", err.Error()))
		os.Exit(1)
	}
}
