// Function to post content directly to Instagram
export const postToInstagram = async (imageData, caption) => {
  try {
    // Convert base64 image data to a File object
    const fetchResponse = await fetch(imageData);
    const blob = await fetchResponse.blob();
    const file = new File([blob], "post-image.jpg", { type: "image/jpeg" });
    
    // Create form data
    const formData = new FormData();
    formData.append("image", file);
    formData.append("caption", caption);
    
    // Make API call to the Instagram posting endpoint
    const response = await fetch("https://bluegill-workable-teal.ngrok-free.app/post", {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to post to Instagram");
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error posting to Instagram:", error);
    throw error;
  }
};

// Function to post a story to Instagram
export const postStoryToInstagram = async (imageData, caption = "") => {
  try {
    // Convert base64 image data to a File object
    const fetchResponse = await fetch(imageData);
    const blob = await fetchResponse.blob();
    const file = new File([blob], "story-image.jpg", { type: "image/jpeg" });
    
    // Create form data
    const formData = new FormData();
    formData.append("image", file);
    formData.append("caption", caption);
    
    // Make API call to the Instagram story posting endpoint
    const response = await fetch("https://bluegill-workable-teal.ngrok-free.app/story", {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to post story to Instagram");
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error posting story to Instagram:", error);
    throw error;
  }
};

// Function to create a highlight on Instagram
export const createHighlightOnInstagram = async (imageData, title) => {
  try {
    // Convert base64 image data to a File object
    const fetchResponse = await fetch(imageData);
    const blob = await fetchResponse.blob();
    const file = new File([blob], "highlight-cover.jpg", { type: "image/jpeg" });
    
    // Create form data
    const formData = new FormData();
    formData.append("image", file);
    formData.append("title", title);
    
    // Make API call to the Instagram highlight creation endpoint
    const response = await fetch("https://bluegill-workable-teal.ngrok-free.app/highlight", {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown error occurred" }));
      throw new Error(errorData.detail || `HTTP error: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error creating highlight on Instagram:", error);
    // Ensure we're returning a string message, not an object
    const errorMessage = error.message || "Unknown error occurred";
    throw new Error(errorMessage);
  }
}; 