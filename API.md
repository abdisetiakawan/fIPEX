# 📚 API Documentation - Digital Exhibition

Comprehensive API documentation for Digital Exhibition platform.

## 🔗 Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## 🔐 Authentication

The API uses JWT tokens stored in HTTP-only cookies for authentication.

### Authentication Flow

1. **Login/Register** → Receive JWT token in cookie
2. **Subsequent requests** → Token automatically sent via cookie
3. **Logout** → Cookie cleared

### Headers

```http
Content-Type: application/json
Cookie: authToken=<jwt-token>
```

## 📋 Response Format

All API responses follow this standard format:

```json
{
  "success": true|false,
  "message": "Response message",
  "data": {
    // Response data
  },
  "errors": [
    // Validation errors (if any)
  ]
}
```

## 🔑 Authentication Endpoints

### Register User

**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "pengunjung|mahasiswa|panitia",
  
  // For mahasiswa only:
  "nim": "12345678",
  "program": "Teknik Informatika",
  "angkatan": "2024",
  
  // For pengunjung only:
  "phone": "081234567890",
  "institution": "Universitas ABC",
  
  "termsAccepted": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "uid": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "pengunjung",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Login User

**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "pengunjung"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "uid": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "pengunjung",
      "lastLogin": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Get Current User

**GET** `/auth/me`

Get current authenticated user information.

**Headers:** `Cookie: authToken=<jwt-token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "uid": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "pengunjung",
      "profile": {
        "bio": "",
        "phone": "081234567890",
        "institution": "Universitas ABC"
      }
    }
  }
}
```

### Update Profile

**PUT** `/auth/profile`

Update user profile information.

**Headers:** `Cookie: authToken=<jwt-token>`

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "bio": "Software Developer",
  "phone": "081234567890",
  "linkedin": "https://linkedin.com/in/johndoe",
  "github": "https://github.com/johndoe"
}
```

### Logout

**POST** `/auth/logout`

Logout user and clear authentication cookie.

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

## 🌐 Public Endpoints

### Get All Works

**GET** `/public/works`

Get all approved works (public access).

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 12, max: 100)
- `category` (string): Filter by category
- `search` (string): Search in title, description, author
- `sort` (string): Sort order (`newest`, `oldest`, `votes`, `views`)

**Example:**
```
GET /public/works?page=1&limit=12&category=Web Development&sort=votes
```

**Response:**
```json
{
  "success": true,
  "data": {
    "works": [
      {
        "id": "work-id",
        "title": "Amazing Web App",
        "description": "A revolutionary web application",
        "category": "Web Development",
        "thumbnail": "/uploads/thumbnail.jpg",
        "author": {
          "id": "author-id",
          "name": "Jane Smith",
          "program": "Teknik Informatika",
          "angkatan": "2024"
        },
        "votes": 45,
        "views": 234,
        "technologies": ["React", "Node.js"],
        "tools": ["VS Code", "Git"],
        "githubUrl": "https://github.com/jane/project",
        "liveUrl": "https://project.vercel.app",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 12
    }
  }
}
```

### Get Work Details

**GET** `/public/works/:id`

Get detailed information about a specific work.

**Response:**
```json
{
  "success": true,
  "data": {
    "work": {
      "id": "work-id",
      "title": "Amazing Web App",
      "description": "Detailed description...",
      "category": "Web Development",
      "thumbnail": "/uploads/thumbnail.jpg",
      "author": {
        "id": "author-id",
        "name": "Jane Smith",
        "program": "Teknik Informatika",
        "angkatan": "2024"
      },
      "votes": 45,
      "views": 235,
      "technologies": ["React", "Node.js", "MongoDB"],
      "tools": ["VS Code", "Git", "Docker"],
      "githubUrl": "https://github.com/jane/project",
      "liveUrl": "https://project.vercel.app",
      "figmaUrl": "https://figma.com/design",
      "videoUrl": "https://youtube.com/watch?v=...",
      "status": "approved",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Vote for Work

**POST** `/public/works/:id/vote`

Vote for a work (requires authentication as pengunjung).

**Headers:** `Cookie: authToken=<jwt-token>`

**Response:**
```json
{
  "success": true,
  "message": "Vote recorded successfully",
  "data": {
    "workId": "work-id",
    "votes": 46
  }
}
```

### Add Comment

**POST** `/public/works/:id/comments`

Add a comment to a work (requires authentication as pengunjung).

**Headers:** `Cookie: authToken=<jwt-token>`

**Request Body:**
```json
{
  "content": "Great work! Love the design."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "comment": {
      "id": "comment-id",
      "content": "Great work! Love the design.",
      "user": {
        "id": "user-id",
        "name": "John Doe",
        "role": "pengunjung"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Get Work Comments

**GET** `/public/works/:id/comments`

Get comments for a specific work.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": "comment-id",
        "content": "Great work!",
        "user": {
          "id": "user-id",
          "name": "John Doe",
          "role": "pengunjung"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 15,
      "itemsPerPage": 10
    }
  }
}
```

### Add/Remove Favorite

**POST** `/public/works/:id/favorite`

Add or remove work from favorites (requires authentication as pengunjung).

**Headers:** `Cookie: authToken=<jwt-token>`

**Response:**
```json
{
  "success": true,
  "message": "Added to favorites",
  "data": {
    "isFavorite": true
  }
}
```

### Get User Favorites

**GET** `/public/favorites`

Get user's favorite works (requires authentication as pengunjung).

**Headers:** `Cookie: authToken=<jwt-token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "works": [
      {
        "id": "work-id",
        "title": "Favorite Work",
        "category": "UI/UX Design",
        "author": {
          "name": "Jane Smith"
        },
        "votes": 30,
        "addedToFavorites": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 5,
      "itemsPerPage": 12
    }
  }
}
```

### Get Statistics

**GET** `/public/stats`

Get public statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalKarya": 156,
    "totalMahasiswa": 89,
    "totalPengunjung": 245,
    "totalVote": 2847,
    "totalComments": 432,
    "categories": {
      "Web Development": 45,
      "UI/UX Design": 38,
      "Aplikasi Mobile": 32,
      "Business Plan": 25,
      "Data Science": 16
    }
  }
}
```

## 📝 Works Management (Mahasiswa)

### Get My Works

**GET** `/works/my-works`

Get current user's works (requires authentication as mahasiswa).

**Headers:** `Cookie: authToken=<jwt-token>`

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by status (`pending`, `approved`, `rejected`)

**Response:**
```json
{
  "success": true,
  "data": {
    "works": [
      {
        "id": "work-id",
        "title": "My Project",
        "description": "Project description",
        "category": "Web Development",
        "status": "approved",
        "votes": 25,
        "views": 150,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 8,
      "itemsPerPage": 10
    }
  }
}
```

### Create Work

**POST** `/works`

Create a new work (requires authentication as mahasiswa).

**Headers:** 
- `Cookie: authToken=<jwt-token>`
- `Content-Type: multipart/form-data`

**Request Body (Form Data):**
```
title: "Amazing Project"
description: "Detailed project description"
category: "Web Development"
technologies: "React,Node.js,MongoDB"
tools: "VS Code,Git,Docker"
githubUrl: "https://github.com/user/project"
liveUrl: "https://project.vercel.app"
figmaUrl: "https://figma.com/design"
videoUrl: "https://youtube.com/watch?v=..."
thumbnail: <file>
```

**Response:**
```json
{
  "success": true,
  "message": "Work created successfully",
  "data": {
    "work": {
      "id": "new-work-id",
      "title": "Amazing Project",
      "description": "Detailed project description",
      "category": "Web Development",
      "status": "pending",
      "authorId": "user-id",
      "author": "User Name",
      "thumbnail": "/uploads/thumbnail-123.jpg",
      "votes": 0,
      "views": 0,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Update Work

**PUT** `/works/:id`

Update an existing work (requires ownership).

**Headers:** 
- `Cookie: authToken=<jwt-token>`
- `Content-Type: multipart/form-data`

**Request Body:** Same as create work

**Response:**
```json
{
  "success": true,
  "message": "Work updated successfully",
  "data": {
    "work": {
      "id": "work-id",
      "title": "Updated Project Title",
      // ... updated work data
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Delete Work

**DELETE** `/works/:id`

Delete a work (requires ownership).

**Headers:** `Cookie: authToken=<jwt-token>`

**Response:**
```json
{
  "success": true,
  "message": "Work deleted successfully",
  "data": {
    "workId": "work-id"
  }
}
```

## 👨‍💼 Admin Endpoints (Panitia)

### Admin Dashboard

**GET** `/admin/dashboard`

Get comprehensive dashboard statistics (requires panitia role).

**Headers:** `Cookie: authToken=<jwt-token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "workStats": {
      "total": 156,
      "pending": 12,
      "approved": 134,
      "rejected": 10,
      "totalVotes": 2847,
      "totalViews": 15432
    },
    "userStats": {
      "total": 334,
      "mahasiswa": 89,
      "panitia": 5,
      "pengunjung": 240,
      "active": 320,
      "inactive": 14
    },
    "votingStats": {
      "totalVotes": 2847,
      "uniqueVoters": 198,
      "votesPerDay": {
        "2024-01-01": 45,
        "2024-01-02": 52
      }
    },
    "categoryStats": {
      "Web Development": {
        "total": 45,
        "approved": 40,
        "pending": 3,
        "rejected": 2,
        "totalVotes": 856
      }
    },
    "topWorks": [
      {
        "id": "work-id",
        "title": "Top Project",
        "author": {
          "name": "Jane Smith",
          "program": "Teknik Informatika"
        },
        "category": "Web Development",
        "votes": 89,
        "views": 456
      }
    ],
    "recentActivities": [
      {
        "id": "activity-id",
        "type": "submission",
        "title": "New Project",
        "author": "John Doe",
        "timestamp": "2024-01-01T00:00:00.000Z",
        "timeAgo": "2 jam lalu"
      }
    ]
  }
}
```

### Get All Works for Review

**GET** `/admin/works`

Get all works for admin review.

**Headers:** `Cookie: authToken=<jwt-token>`

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by status
- `category`: Filter by category
- `search`: Search works

**Response:**
```json
{
  "success": true,
  "data": {
    "works": [
      {
        "id": "work-id",
        "title": "Project Title",
        "description": "Description",
        "category": "Web Development",
        "status": "pending",
        "author": {
          "id": "author-id",
          "name": "Student Name",
          "email": "student@email.com",
          "nim": "12345678",
          "program": "Teknik Informatika"
        },
        "voteCount": 25,
        "commentCount": 8,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

### Review Work

**PUT** `/admin/works/:id/review`

Approve or reject a work.

**Headers:** `Cookie: authToken=<jwt-token>`

**Request Body:**
```json
{
  "status": "approved|rejected",
  "feedback": "Optional feedback message for rejection"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Work approved successfully",
  "data": {
    "work": {
      "id": "work-id",
      "status": "approved",
      "reviewedBy": "admin-id",
      "reviewedAt": "2024-01-01T00:00:00.000Z",
      "feedback": ""
    }
  }
}
```

### Get All Users

**GET** `/admin/users`

Get all users for management.

**Headers:** `Cookie: authToken=<jwt-token>`

**Query Parameters:**
- `page`, `limit`: Pagination
- `role`: Filter by role
- `status`: Filter by status
- `search`: Search users

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user-id",
        "name": "User Name",
        "email": "user@email.com",
        "role": "mahasiswa",
        "status": "active",
        "nim": "12345678",
        "program": "Teknik Informatika",
        "worksCount": 3,
        "approvedWorksCount": 2,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 100,
      "itemsPerPage": 10
    }
  }
}
```

### Update User Status

**PUT** `/admin/users/:id/status`

Update user account status.

**Headers:** `Cookie: authToken=<jwt-token>`

**Request Body:**
```json
{
  "status": "active|inactive|banned"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User status updated to active",
  "data": {
    "userId": "user-id",
    "status": "active"
  }
}
```

## 📅 Session Management (Panitia)

### Get All Sessions

**GET** `/panitia/sessions`

Get all scheduled sessions.

**Headers:** `Cookie: authToken=<jwt-token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "session-id",
        "title": "Voting Period",
        "description": "Period for voting on approved works",
        "type": "voting",
        "startDate": "2024-01-15T09:00:00.000Z",
        "endDate": "2024-01-20T17:00:00.000Z",
        "status": "scheduled",
        "createdBy": "admin-id",
        "notificationSent": true,
        "emailStats": {
          "sent": 245,
          "failed": 2
        }
      }
    ]
  }
}
```

### Create Session

**POST** `/panitia/sessions`

Create a new session with email notifications.

**Headers:** `Cookie: authToken=<jwt-token>`

**Request Body:**
```json
{
  "title": "Voting Period",
  "description": "Period for voting on approved works",
  "type": "voting|exhibition|review|announcement",
  "startDate": "2024-01-15T09:00:00.000Z",
  "endDate": "2024-01-20T17:00:00.000Z",
  "sendNotification": true,
  "targetRoles": ["mahasiswa", "pengunjung"],
  "scheduleReminders": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Session created successfully",
  "data": {
    "session": {
      "id": "new-session-id",
      "title": "Voting Period",
      "description": "Period for voting on approved works",
      "type": "voting",
      "status": "scheduled",
      "startDate": "2024-01-15T09:00:00.000Z",
      "endDate": "2024-01-20T17:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Send Manual Notification

**POST** `/panitia/sessions/:id/notify`

Send manual notification for a session.

**Headers:** `Cookie: authToken=<jwt-token>`

**Request Body:**
```json
{
  "roles": ["mahasiswa", "pengunjung"],
  "type": "reminder"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notifications sent successfully",
  "data": {
    "results": [
      {
        "role": "mahasiswa",
        "sent": 89,
        "failed": 1,
        "total": 90
      },
      {
        "role": "pengunjung", 
        "sent": 240,
        "failed": 5,
        "total": 245
      }
    ]
  }
}
```

## ❌ Error Responses

### Validation Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address",
      "value": "invalid-email"
    }
  ]
}
```

### Authentication Error

```json
{
  "success": false,
  "message": "Access token required",
  "code": "TOKEN_REQUIRED"
}
```

### Authorization Error

```json
{
  "success": false,
  "message": "Insufficient permissions",
  "code": "INSUFFICIENT_PERMISSIONS",
  "required": ["panitia"],
  "current": "mahasiswa"
}
```

### Not Found Error

```json
{
  "success": false,
  "message": "Work not found",
  "code": "RESOURCE_NOT_FOUND"
}
```

### Rate Limit Error

```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

## 🔒 Security Notes

1. **Authentication:** All protected endpoints require valid JWT token in cookie
2. **Authorization:** Role-based access control enforced
3. **Rate Limiting:** API calls are rate-limited to prevent abuse
4. **Input Validation:** All inputs are validated and sanitized
5. **File Upload:** File uploads are restricted by type and size
6. **CORS:** Cross-origin requests are properly configured

## 📊 Rate Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| General | 100 requests | 15 minutes |
| Authentication | 5 requests | 15 minutes |
| File Upload | 10 requests | 1 hour |
| Voting | 10 requests | 1 minute |
| Comments | 20 requests | 5 minutes |

---

**API Documentation Complete! 📚**

For more information or support, please refer to the main documentation or contact the development team.