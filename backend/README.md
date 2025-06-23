# API Template (Updated)

## About
This is an opinionated API template that comes with a lot of the boilerplate code for creating APIs. The API is easily
configurable and comes with a dockerfile, structured logging, and prometheus metrics exported at the `/metrics`
endpoint. There are make targets for building a binary, building and running a docker-image, and linting.

## Quickstart
To quickly start up the API, run `make build-image` and then `make run-image`. This will build and run a docker
image of the API. Alternatively, run `make build` to build a binary and then `./api-template serve` to run the newly
built `api-template` binary.

By default the API will run on port 8080, but this can be changed by configuration

## CLI
The binary comes packaged as a CLI with two commands:

| Command      | Description |
| ----------- | ----------- |
| version      | Print the version of the binary. This should be the git commit of the branch at the time the binary was built       |
| serve   | Start the API        |

The API also comes with flags:
| Flag | Shorthand | Description |
| ----------- | ----------- | ----------- |
| --config |   -c | Run the binary using the specified config file|

## Configuration
The API configuration is managed by the [Viper](https://github.com/spf13/viper) library. This allows customization via
`config.yaml` or any other config file passed in via the `--config` argument. The values in the config yaml can be
overridden by specifying environment variables. The key for configuration environment variables follows the
`{PREFIX}_{ENVIRONMENT_VALUE}` format. The prefix is `OVERRIDE` by default but that can be changed in the config code.
The remaining part of the environment variable key is the path to the yaml in all caps with underscores separating the
different words. Refer to the [Viper](https://github.com/spf13/viper) GitHub page for more details.

## Metrics
Metrics are exported by Prometheus at `/metrics`. There is sample code that creates a new metric that tracks total
requests to one of the endpoints. This can be extended to any metric that Prometheus supports.

## Docker
The API comes with a dockerfile. It builds in two stages and the end result is a roughly 12MB docker image.
`make build-image` builds and `make run-image` runs the image.

## References
https://github.com/spf13/cobra  
https://github.com/spf13/viper  
https://prometheus.io/docs/concepts/metric_types  

## Email Sending with Postmark

- The API now supports sending emails via [Postmark](https://postmarkapp.com/) using their REST API.
- The `/email` endpoint accepts a POST request with `{ "message": "..." }` and sends the message to `perry@fitzpatrick-family.com`.
- **Important:** The `From` address must be a verified sender signature in your Postmark account. Update `backend/api/handlers/email.go` if you change the sender.
- The Postmark API token is used as the `X-Postmark-Server-Token` header for authentication.
- If you get HTTP 422 errors, check that your sender signature is verified in Postmark.
- The API returns clear JSON responses for success and error cases.

## Running the API

- Build: `cd backend && go build -o api-server .`
- Run: `./api-server serve`
- The API runs on port 8080 by default (see `config.yaml`).
- Test email endpoint:
  ```sh
  curl -X POST http://localhost:8080/email -H "Content-Type: application/json" -d '{"message":"Test email from API"}'
  ```

## Angular Frontend Integration

- The Angular frontend includes a contact form on the homepage that POSTs to `/email`.
- The form uses `ngModel` and `FormsModule` for two-way binding.
- The frontend expects a JSON response with `success` and `message` fields.
- Make sure the Go API is running locally for development, or update the endpoint URL for production.

## Troubleshooting

- **HTTP 422 from Postmark:**
  - The sender signature is not verified. Go to your Postmark dashboard, add and verify the sender email.
- **500 Internal Server Error:**
  - Usually caused by a 422 from Postmark. Check the error message in the API response.
- **CORS:**
  - The Go API includes CORS middleware for local development and frontend integration.

## SMTP vs API

- The REST API is recommended for web apps (better error handling, faster, more features).
- SMTP is available if you want to use it, but requires different configuration and is not currently used in this project.

## Security
- Do not commit your Postmark API token to public repositories.
- Store secrets in environment variables or secure config files for production.

---

_Last updated: 2025-06-22_
