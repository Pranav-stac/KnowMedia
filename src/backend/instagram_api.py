import os
import shutil
import logging
import traceback
from typing import Optional
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Instagram API Service")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock Instagram bot class for demonstration
class InstagramBot:
    def create_post(self, image_path, caption):
        logger.info(f"Creating post with caption: {caption}")
        # In a real implementation, this would use the Instagram API
        # For demo purposes, we'll just return a mock response
        return MockMedia(id="1234567890")
    
    def create_story(self, image_path, caption=None):
        logger.info(f"Creating story with caption: {caption}")
        # In a real implementation, this would use the Instagram API
        return MockMedia(id="2345678901")
    
    def create_highlight(self, image_path, title):
        logger.info(f"Creating highlight with title: {title}")
        # In a real implementation, this would use the Instagram API
        return MockMedia(id="3456789012")

# Mock Media class
class MockMedia:
    def __init__(self, id):
        self.id = id

# Initialize Instagram bot
bot = InstagramBot()

# Custom exception handler
@app.exception_handler(Exception)
async def generic_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {str(exc)}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)}
    )

@app.post("/post")
async def create_instagram_post(
    image: UploadFile = File(...),
    caption: str = Form(...)
):
    """
    Create a new Instagram post
    
    Args:
        image: Image file to post
        caption: Caption for the post
    
    Returns:
        dict: Response containing post details
    """
    try:
        # Create temporary directory if it doesn't exist
        temp_dir = "temp_uploads"
        os.makedirs(temp_dir, exist_ok=True)
        
        # Save uploaded file temporarily
        temp_image_path = os.path.join(temp_dir, image.filename)
        with open(temp_image_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        
        try:
            # Create the post
            media = bot.create_post(temp_image_path, caption)
            
            return {
                "status": "success",
                "message": "Post created successfully",
                "media_id": media.id,
                "caption": caption
            }
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_image_path):
                os.remove(temp_image_path)
                
    except Exception as e:
        logger.error(f"Error creating post: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/story")
async def create_instagram_story(
    image: UploadFile = File(...),
    caption: Optional[str] = Form("")
):
    """
    Create a new Instagram story
    
    Args:
        image: Image file to post as a story
        caption: Optional caption for the story
    
    Returns:
        dict: Response containing story details
    """
    try:
        # Create temporary directory if it doesn't exist
        temp_dir = "temp_uploads"
        os.makedirs(temp_dir, exist_ok=True)
        
        # Save uploaded file temporarily
        temp_image_path = os.path.join(temp_dir, image.filename)
        with open(temp_image_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        
        try:
            # Create the story
            media = bot.create_story(temp_image_path, caption)
            
            return {
                "status": "success",
                "message": "Story created successfully",
                "media_id": media.id,
                "caption": caption
            }
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_image_path):
                os.remove(temp_image_path)
                
    except Exception as e:
        logger.error(f"Error creating story: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/highlight")
async def create_instagram_highlight(
    image: UploadFile = File(...),
    title: str = Form(...)
):
    """
    Create a new Instagram highlight
    
    Args:
        image: Cover image for the highlight
        title: Title for the highlight
    
    Returns:
        dict: Response containing highlight details
    """
    try:
        if not title or len(title.strip()) == 0:
            raise HTTPException(status_code=400, detail="Highlight title cannot be empty")
            
        # Validate image file
        if not image.filename or not image.content_type or not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Invalid image file. Please upload a valid image.")
            
        # Create temporary directory if it doesn't exist
        temp_dir = "temp_uploads"
        os.makedirs(temp_dir, exist_ok=True)
        
        # Save uploaded file temporarily
        temp_image_path = os.path.join(temp_dir, image.filename)
        with open(temp_image_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        
        try:
            # Create the highlight
            media = bot.create_highlight(temp_image_path, title)
            
            return {
                "status": "success",
                "message": "Highlight created successfully",
                "media_id": media.id,
                "title": title
            }
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_image_path):
                os.remove(temp_image_path)
                
    except HTTPException:
        # Re-raise HTTP exceptions (for validation errors)
        raise
    except Exception as e:
        logger.error(f"Error creating highlight: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to create highlight: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 