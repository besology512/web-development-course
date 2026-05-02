# ClipSphere ER Diagram

## Entity-Relationship Diagram

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        String username UK
        String email UK
        String password
        String role
        String bio
        String avatarKey
        Boolean active
        String accountStatus
        Object notifications
        DateTime createdAt
        DateTime updatedAt
    }

    VIDEO {
        ObjectId _id PK
        String title
        String description
        ObjectId owner FK
        String videoURL
        Number duration
        Number viewsCount
        String status
        DateTime createdAt
        DateTime updatedAt
    }

    REVIEW {
        ObjectId _id PK
        Number rating
        String comment
        ObjectId user FK
        ObjectId video FK
        DateTime createdAt
        DateTime updatedAt
    }

    FOLLOWER {
        ObjectId _id PK
        ObjectId followerId FK
        ObjectId followingId FK
        DateTime createdAt
        DateTime updatedAt
    }

    TIP {
        ObjectId _id PK
        Number amount
        ObjectId from FK
        ObjectId to FK
        ObjectId video FK
        DateTime createdAt
        DateTime updatedAt
    }

    USER ||--o{ VIDEO : "owns"
    USER ||--o{ REVIEW : "writes"
    VIDEO ||--o{ REVIEW : "has"
    USER ||--o{ FOLLOWER : "follows (followerId)"
    USER ||--o{ FOLLOWER : "followed by (followingId)"
    USER ||--o{ TIP : "sends (from)"
    USER ||--o{ TIP : "receives (to)"
    VIDEO ||--o{ TIP : "receives"
```

## Relationships Summary

| Relationship | Type | Description |
|---|---|---|
| User → Video | One-to-Many | A user owns many videos |
| User → Review | One-to-Many | A user writes many reviews |
| Video → Review | One-to-Many | A video has many reviews |
| User → Follower | One-to-Many | A user can follow many users |
| User → Follower | One-to-Many | A user can be followed by many users |
| User → Tip | One-to-Many | A user can send and receive many tips |
| Video → Tip | One-to-Many | A video can receive many tips |

## Constraints

- **User**: `username` and `email` are unique
- **Review**: Compound unique index on `(user, video)` — one review per user per video
- **Follower**: Compound unique index on `(followerId, followingId)` — no duplicate follows
- **Follower**: Pre-save hook prevents self-following (`followerId !== followingId`)
