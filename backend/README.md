# Doc Sign Backend

This repository contains the backend API for the Doc Sign application.

## Environment Variables

The following environment variables are required for the application to function correctly. Create a `.env` file in the root of the project and add the necessary variables:

-   `MONGO_CONNECTION_STRING`: The connection string for the MongoDB database. Example: `mongodb://localhost:27017/signature`.
-   `CURRENT_SERVER_URL`: The URL of the current server. Example: `http://localhost:3000`.
-   `INTERNAL_REQUEST_TOKEN`: A secret token used for internal requests. Example: `aaasdfasdf`.
- `REDIS_PASSWORD`: The password for redis server.
-   `NODE_ENV`: The environment the application is running in (e.g., `local`, `development`, `production`). Example: `local`.
-   `FRONTEND_URL`: The URL of the frontend application. Example: `http://localhost:2001`.
-   `EMAIL_HOST`: The host for the email server. Example: `smtp.ethereal.email`.
-   `EMAIL_PORT`: The port for the email server. Example: `587`.
-   `EMAIL_AUTH_USER`: The username for email server authentication. Example: `emil.oconnell@ethereal.email`.
-   `EMAIL_AUTH_PASS`: The password for email server authentication. Example: `RTkeVn3y3V9bJbCrGg`.

> ⚠️ Redis is required: Make sure Redis is installed and running on your machine. It is used for caching and session management within the application.
Example `.env` file:

MONGO_CONNECTION_STRING=mongodb://localhost:27017/test
CURRENT_SERVER_URL=http://localhost:3000
INTERNAL_REQUEST_TOKEN=aaasdfasdf
NODE_ENV=local
FRONTEND_URL=http://localhost:2001
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_AUTH_USER=emil.oconnell@ethereal.email
EMAIL_AUTH_PASS=RTkeVn3y3V9bJbCrGg

### Usage

1.  **Install dependencies:**

    ```bash
    npm install # or yarn install
    ```

2.  **Create a `.env` file and set environment variables:**

    As described in the "Environment Variables" section above.

3.  **Run database migrations (if applicable):**

    Please specify admin email and password in migration file.
    ```bash
    npm run migrate
    ```

    *Replace `npm run migrate` with the actual command for your migration tool.*

4.  **Start the development server:**

    ```bash
    npm run dev # or yarn dev
    ```

    The API will be accessible at the URL specified in `CURRENT_SERVER_URL`.
