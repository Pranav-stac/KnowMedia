# Instagram API Backend

This backend service provides API endpoints for posting content to Instagram, including regular posts, stories, and highlights.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
uvicorn instagram_api:app --reload
```

The server will start on `http://localhost:8000`.

## API Endpoints

### Create a Post
- **URL**: `/post`
- **Method**: `POST`
- **Form Data**:
  - `image`: File (image to post)
  - `caption`: String (caption for the post)

### Create a Story
- **URL**: `/story`
- **Method**: `POST`
- **Form Data**:
  - `image`: File (image for the story)
  - `caption`: String (optional caption for the story)

### Create a Highlight
- **URL**: `/highlight`
- **Method**: `POST`
- **Form Data**:
  - `image`: File (cover image for the highlight)
  - `title`: String (title for the highlight)

## API Documentation

Once the server is running, you can access the auto-generated API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc` 