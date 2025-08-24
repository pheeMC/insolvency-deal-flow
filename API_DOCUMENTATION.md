# VDR PHP Backend API Documentation

## Overview
This documentation outlines all API endpoints required for the Virtual Data Room (VDR) PHP backend. The frontend is built with React/TypeScript and communicates with the PHP backend via REST API.

## Base Configuration
- **Base URL**: `https://your-domain.com/api` (production) or `http://localhost/api` (development)
- **Authentication**: Bearer Token (JWT recommended)
- **Content-Type**: `application/json` (unless specified otherwise)

## Authentication
All API endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer {jwt_token}
```

## Response Format
All API responses follow this format:
```json
{
  "success": true,
  "data": {...},
  "message": "Optional success message"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Endpoints

### Dashboard API

#### GET /dashboard/stats
Returns dashboard statistics
```json
{
  "success": true,
  "data": {
    "totalDocuments": 247,
    "activeUsers": 18,
    "qaThreads": 42,
    "submittedBids": 6,
    "changeMetrics": {
      "documents": "+12%",
      "users": "+3",
      "qa": "+8",
      "bids": "+2"
    }
  }
}
```

#### GET /dashboard/recent-activity
Returns recent activity log
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "type": "document",
      "title": "Financial Statements Q3 2024 uploaded",
      "user": "M&A Advisor",
      "time": "2024-01-17T10:30:00Z",
      "icon": "FileText"
    }
  ]
}
```

#### GET /dashboard/deal-metrics
Returns deal-specific metrics
```json
{
  "success": true,
  "data": {
    "enterpriseValue": "€125M",
    "dealType": "Asset Deal", 
    "timeline": "14 Days",
    "bidders": "8 Active",
    "phase": "NBO",
    "daysRemaining": 14
  }
}
```

#### GET /dashboard/export/activity-report
Returns downloadable activity report (PDF/Excel)
- Response: Binary file download

#### GET /dashboard/access-logs
Returns access logs for audit trail

### Documents API

#### GET /documents
Returns document structure
- Query params: `?folder={folderId}` (optional)

#### GET /documents/{id}
Returns specific document details

#### POST /documents/upload
Uploads new document
- Content-Type: `multipart/form-data`
- Fields: `file`, `name`, `access`, `watermark`, `folderId` (optional)

#### POST /documents/folder
Creates new folder
```json
{
  "name": "Folder Name",
  "parentId": "optional-parent-id",
  "access": "full|restricted|clean-team"
}
```

#### PUT /documents/{id}
Updates document metadata

#### DELETE /documents/{id}
Deletes document

#### GET /documents/{id}/download
Downloads specific document
- Response: Binary file download with watermark

#### POST /documents/bulk-download
Downloads multiple documents as ZIP
```json
{
  "documentIds": ["id1", "id2", "id3"]
}
```

#### GET /documents/search
Searches documents
- Query params: `?q={search_term}`

### Q&A API

#### GET /qa/threads
Returns Q&A threads with pagination
- Query params: `?page=1&limit=20&status=all&category=all&priority=all&search=term`

#### GET /qa/threads/{id}
Returns specific Q&A thread

#### POST /qa/threads
Creates new Q&A thread
```json
{
  "category": "Legal",
  "title": "Question title",
  "question": "Question content",
  "priority": "high|medium|low",
  "visibility": "all-bidders|specific-bidder|internal"
}
```

#### PUT /qa/threads/{id}
Updates Q&A thread

#### POST /qa/threads/{id}/answer
Adds answer to thread
```json
{
  "answer": "Answer content",
  "publishTo": "all-bidders|specific-bidder|draft"
}
```

#### PUT /qa/threads/{id}/status
Updates thread status
```json
{
  "status": "new|in-review|answered|published"
}
```

#### POST /qa/threads/{id}/notes
Adds internal note to thread
```json
{
  "note": "Internal note content"
}
```

#### GET /qa/categories
Returns available Q&A categories

#### DELETE /qa/threads/{id}
Deletes Q&A thread

### Users API

#### GET /users
Returns users with pagination and filtering
- Query params: `?page=1&limit=20&role=all&status=all&organization=all&search=term`

#### GET /users/{id}
Returns specific user details

#### POST /users/invite
Invites new user
```json
{
  "email": "user@example.com",
  "role": "bidder-lead",
  "organization": "Company Name",
  "accessLevel": ["Phase 2 Documents", "Q&A Submission"]
}
```

#### PUT /users/{id}
Updates user details

#### PUT /users/{id}/status
Updates user status
```json
{
  "status": "active|pending|suspended"
}
```

#### PUT /users/{id}/role
Updates user role and access
```json
{
  "role": "bidder-lead",
  "accessLevel": ["Phase 2 Documents", "Q&A Submission"]
}
```

#### DELETE /users/{id}
Deletes user

#### GET /users/{id}/activity
Returns user activity log

#### POST /users/{id}/message
Sends message to user
```json
{
  "subject": "Message subject",
  "message": "Message content"
}
```

#### GET /users/roles
Returns available user roles

#### GET /users/organizations
Returns list of organizations

### Bids API

#### GET /bids
Returns bids list
- Query params: `?phase=NBO&status=submitted`

#### GET /bids/{id}
Returns specific bid details

#### POST /bids
Creates new bid
```json
{
  "bidderName": "Strategic Investor A",
  "bidderType": "strategic|financial",
  "amount": 125000000,
  "currency": "EUR",
  "phase": "IOI|NBO|Final",
  "conditions": ["Due diligence completion", "Regulatory approval"],
  "submittedBy": "user_id"
}
```

#### PUT /bids/{id}
Updates bid

#### PUT /bids/{id}/status
Updates bid status
```json
{
  "status": "draft|submitted|reviewed|shortlisted|rejected"
}
```

#### DELETE /bids/{id}
Deletes bid

#### POST /bids/{id}/attachments
Uploads bid attachment
- Content-Type: `multipart/form-data`

#### GET /bids/export
Exports bids data
- Query params: `?format=excel|pdf`
- Response: Binary file download

### Timeline API

#### GET /timeline/events
Returns timeline events
- Query params: `?startDate=2024-01-01&endDate=2024-12-31`

#### GET /timeline/events/{id}
Returns specific timeline event

#### POST /timeline/events
Creates timeline event
```json
{
  "date": "2024-01-20",
  "time": "14:00",
  "title": "NBO Deadline",
  "description": "Non-binding offers due",
  "type": "milestone|document|qa|bid|meeting",
  "status": "completed|ongoing|upcoming",
  "participants": ["user1", "user2"]
}
```

#### PUT /timeline/events/{id}
Updates timeline event

#### DELETE /timeline/events/{id}
Deletes timeline event

#### GET /timeline/milestones
Returns major milestones only

### Settings API

#### GET /settings
Returns current deal settings

#### PUT /settings
Updates deal settings
```json
{
  "dealName": "Test GmbH - Asset Deal",
  "dealType": "Asset Deal",
  "phase": "NBO",
  "timeline": {
    "nboDeadline": "2024-02-01",
    "finalBidDeadline": "2024-03-01",
    "closingExpected": "2024-04-01"
  },
  "access": {
    "watermarkEnabled": true,
    "downloadRestrictions": true,
    "auditLogging": true
  },
  "notifications": {
    "emailAlerts": true,
    "qaNotifications": true,
    "bidNotifications": true
  }
}
```

#### PUT /settings/deal
Updates deal-specific settings

#### PUT /settings/access
Updates access control settings

#### PUT /settings/notifications
Updates notification settings

#### POST /settings/backup
Creates system backup
- Response: Download URL for backup file

#### POST /settings/restore
Restores from backup
- Content-Type: `multipart/form-data`

## Database Schema Requirements

### Tables Needed:

1. **users** - User management
2. **documents** - Document storage metadata
3. **qa_threads** - Q&A management
4. **bids** - Bid management
5. **timeline_events** - Timeline/calendar events
6. **activity_logs** - Audit trail
7. **settings** - System configuration
8. **access_logs** - Access tracking
9. **notifications** - Email/alert management

## Security Requirements

1. **JWT Authentication** - All endpoints require valid JWT
2. **Role-based Access Control** - Different permissions per user role
3. **Document Watermarking** - Dynamic watermarks on document downloads
4. **Audit Logging** - Track all user actions
5. **File Upload Security** - Virus scanning, file type validation
6. **Rate Limiting** - Prevent abuse
7. **HTTPS Only** - SSL/TLS encryption required

## File Storage

- Documents should be stored securely outside web root
- Support for large file uploads (up to 100MB)
- Automatic backup of uploaded files
- Version control for document updates

## Email Integration

- SMTP configuration for notifications
- Email templates for invitations, alerts
- Queue system for bulk emails

## Implementation Notes

- Use PHP 8+ with modern framework (Laravel/Symfony recommended)
- MySQL/PostgreSQL database
- Redis for caching and sessions
- File storage: Local or cloud (AWS S3, etc.)
- PDF generation for reports and watermarking
- Background job processing for heavy tasks