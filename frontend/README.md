# Doc Sign Frontend

This repository contains the frontend code for the Doc Sign application.

## Environment Variables

The following environment variables are required for the application to function correctly:

-   `VITE_BACKEND_URL`: The URL of the backend API.

### Usage
1.  **Set environment variables:**

    Create a `.env` file in the root of the project and add the necessary environment variables:

    ```
    VITE_BACKEND_URL=your_backend_url
    ```

    Replace `your_backend_url` with the actual URL of your backend.

2.  **Start the development server:**

    ```bash
    npm run dev
    ```

    The application will be accessible at `http://localhost:2001` (or the port specified by your setup).

### Build

To create a production build of the application:

```bash
npm run build
```