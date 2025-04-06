// Function to post content directly to Instagram
export const postToInstagram = async (imageData, caption) => {
  try {
    // Convert base64 image data to a File object
    const fetchResponse = await fetch(imageData);
    const blob = await fetchResponse.blob();
    const file = new File([blob], "post-image.jpg", { type: "image/jpeg" });
    
    // Create form data
    const formData = new FormData();
    formData.append("file", file);
    formData.append("caption", caption);
    
    // Make API call to the Instagram posting endpoint
    const response = await fetch("https://bluegill-workable-teal.ngrok-free.app/post/photo", {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      let errorMessage = "Failed to post to Instagram";
      try {
        const errorData = await response.json();
        if (errorData) {
          if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else {
            errorMessage = `Failed to post: ${JSON.stringify(errorData)}`;
          }
        }
      } catch (jsonError) {
        errorMessage = `Failed to post to Instagram: ${response.statusText} (Status: ${response.status}) - Could not parse error response.`;
      }
      throw new Error(errorMessage);
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
    formData.append("file", file);
    formData.append("caption", caption);
    
    // Make API call to the Instagram story posting endpoint
    const response = await fetch("https://bluegill-workable-teal.ngrok-free.app/post/story", {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      let errorMessage = "Failed to post story to Instagram";
      try {
        const errorData = await response.json();
        if (errorData) {
          if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else {
            errorMessage = `Failed to post story: ${JSON.stringify(errorData)}`;
          }
        }
      } catch (jsonError) {
        errorMessage = `Failed to post story to Instagram: ${response.statusText} (Status: ${response.status}) - Could not parse error response.`;
      }
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error posting story to Instagram:", error);
    throw error;
  }
};

// Function to post a reel to Instagram
export const postReelToInstagram = async (videoData, caption = "") => {
  // Add check for valid video data source
  if (typeof videoData !== 'string' || !videoData) {
    const errorMessage = "Invalid or missing video data provided for reel post.";
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  try {
    // Convert base64 video data to a File object
    const fetchResponse = await fetch(videoData);
    const blob = await fetchResponse.blob();
    // Assuming the blob type indicates a video, default to mp4 if needed
    const fileType = blob.type.startsWith('video/') ? blob.type : 'video/mp4';
    const fileName = "reel-video." + (fileType.split('/')[1] || 'mp4');
    const file = new File([blob], fileName, { type: fileType });
    
    // Create form data
    const formData = new FormData();
    formData.append("file", file); // Use "file" key as expected by the backend
    formData.append("caption", caption);
    
    // Make API call to the Instagram reel posting endpoint
    const response = await fetch("https://bluegill-workable-teal.ngrok-free.app/post/reel", {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      let errorMessage = "Failed to post reel to Instagram";
      try {
        const errorData = await response.json();
        if (errorData) {
          if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else {
            errorMessage = `Failed to post reel: ${JSON.stringify(errorData)}`;
          }
        }
      } catch (jsonError) {
        errorMessage = `Failed to post reel to Instagram: ${response.statusText} (Status: ${response.status}) - Could not parse error response.`;
      }
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error posting reel to Instagram:", error);
    throw error;
  }
};

// Function to create a highlight on Instagram
// export const createHighlightOnInstagram = async (imageData, title) => {
//   try {
//     // Convert base64 image data to a File object
//     const fetchResponse = await fetch(imageData);
//     const blob = await fetchResponse.blob();
//     const file = new File([blob], "highlight-cover.jpg", { type: "image/jpeg" });
    
//     // Create form data
//     const formData = new FormData();
//     formData.append("image", file);
//     formData.append("title", title);
    
//     // Make API call to the Instagram highlight creation endpoint
//     const response = await fetch("https://bluegill-workable-teal.ngrok-free.app/highlight", {
//       method: "POST",
//       body: formData,
//     });
    
//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({ detail: "Unknown error occurred" }));
//       throw new Error(errorData.detail || `HTTP error: ${response.status}`);
//     }
    
//     const result = await response.json();
//     return result;
//   } catch (error) {
//     console.error("Error creating highlight on Instagram:", error);
//     // Ensure we're returning a string message, not an object
//     const errorMessage = error.message || "Unknown error occurred";
//     throw new Error(errorMessage);
//   }
// }; 