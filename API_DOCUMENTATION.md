# API Documentation for Tubes Kemjar

## Overview

This API is built using Hono.js integrated with Next.js and Clerk for authentication. All endpoints follow a standardized response format and authentication flow.

## Authentication

Authentication is handled by Clerk. Protected endpoints require a valid Clerk session token and will return a 401 Unauthorized response if authentication fails.

The API uses the following authentication headers:

- `X-Clerk-User-Id`: Set by Next.js middleware for authenticated users

## Standard Response Format

All API endpoints follow a standardized response format:

### Success Response

```json
{
  "success": true,
  "data": {
    /* Response data */
  },
  "meta": {
    "timestamp": "ISO formatted date",
    "requestId": "unique-request-id"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      /* Additional error details */
    }
  },
  "meta": {
    "timestamp": "ISO formatted date",
    "requestId": "unique-request-id"
  }
}
```

## API Endpoints

### Health Check

- **URL:** `/api`
- **Method:** `GET`
- **Authentication:** Optional
- **Description:** Check if the API is operational
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "message": "API server is running",
      "auth": "authenticated | unauthenticated",
      "environment": "development | production"
    },
    "meta": {
      /* metadata */
    }
  }
  ```

### Posts

#### Get All Posts

- **URL:** `/api/posts`
- **Method:** `GET`
- **Authentication:** Required
- **Description:** Retrieves all posts for the authenticated user
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "title": "Post title",
        "content": "Post content",
        "createdAt": "ISO date",
        "authorId": 1,
        "author": {
          "id": 1,
          "name": "User name",
          "email": "user@example.com"
        }
      }
    ],
    "meta": {
      /* metadata */
    }
  }
  ```

#### Create Post

- **URL:** `/api/posts`
- **Method:** `POST`
- **Authentication:** Required
- **Description:** Creates a new post for the authenticated user
- **Request Body:**
  ```json
  {
    "title": "Post title",
    "content": "Post content"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "title": "Post title",
      "content": "Post content",
      "createdAt": "ISO date",
      "authorId": 1,
      "author": {
        "id": 1,
        "name": "User name",
        "email": "user@example.com"
      }
    },
    "meta": {
      /* metadata */
    }
  }
  ```

#### Get Post

- **URL:** `/api/posts/:id`
- **Method:** `GET`
- **Authentication:** Required
- **Description:** Gets a specific post by ID (must be owned by the authenticated user)
- **URL Parameters:** `id` - ID of the post to retrieve
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "title": "Post title",
      "content": "Post content",
      "createdAt": "ISO date",
      "authorId": 1,
      "author": {
        "id": 1,
        "name": "User name",
        "email": "user@example.com"
      }
    },
    "meta": {
      /* metadata */
    }
  }
  ```

#### Update Post

- **URL:** `/api/posts/:id`
- **Method:** `PUT`
- **Authentication:** Required
- **Description:** Updates a specific post (must be owned by the authenticated user)
- **URL Parameters:** `id` - ID of the post to update
- **Request Body:**
  ```json
  {
    "title": "Updated title",
    "content": "Updated content"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "title": "Updated title",
      "content": "Updated content",
      "createdAt": "ISO date",
      "authorId": 1,
      "author": {
        "id": 1,
        "name": "User name",
        "email": "user@example.com"
      }
    },
    "meta": {
      /* metadata */
    }
  }
  ```

#### Delete Post

- **URL:** `/api/posts/:id`
- **Method:** `DELETE`
- **Authentication:** Required
- **Description:** Deletes a specific post (must be owned by the authenticated user)
- **URL Parameters:** `id` - ID of the post to delete
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "message": "Post deleted successfully"
    },
    "meta": {
      /* metadata */
    }
  }
  ```

### Test Endpoints

#### Hono-Clerk Integration Test

- **URL:** `/api/hono-clerk-test`
- **Method:** `GET`
- **Authentication:** Optional
- **Description:** Tests the integration between Clerk and Hono
- **Response:**
  ```json
  {
    "message": "Hono-Clerk integration test endpoint",
    "auth": {
      "clerkId": "clerk-user-id or not authenticated",
      "sessionId": "session-id or no session",
      "isSignedIn": true|false
    },
    "userInfo": { /* user data if found */ },
    "timestamp": "ISO date"
  }
  ```

#### Hono Auth Test

- **URL:** `/api/hono-auth-test`
- **Method:** `GET`
- **Authentication:** Optional
- **Description:** Tests Hono authentication with Clerk cookies and headers
- **Response:**
  ```json
  {
    "message": "Hono with Clerk Test",
    "auth": {
      "clerkUserId": "clerk-user-id or not authenticated",
      "hasSession": true|false
    },
    "userData": { /* user data if found */ },
    "timestamp": "ISO date"
  }
  ```

## Error Codes

- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: User doesn't have permission to access the resource
- `INVALID_POST_ID`: The post ID provided is invalid
- `POST_NOT_FOUND`: The requested post was not found
- `FETCH_POSTS_ERROR`: Error occurred while fetching posts
- `CREATE_POST_ERROR`: Error occurred while creating a post
- `UPDATE_POST_ERROR`: Error occurred while updating a post
- `DELETE_POST_ERROR`: Error occurred while deleting a post
- `INTERNAL_SERVER_ERROR`: Generic server error

## Rate Limiting

Rate limiting is currently not implemented but may be added in the future.

## Cross-Origin Resource Sharing (CORS)

CORS is enabled for all API endpoints with the following configuration:

- Allowed origins: `http://localhost:3000` and the value of `NEXT_PUBLIC_APP_URL` environment variable
- Allowed methods: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`
- Allowed headers: `Content-Type`, `Authorization`, `X-Clerk-User-Id`
- Exposed headers: `X-Request-Id`
- Credentials: `true`
