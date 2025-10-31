document.addEventListener("DOMContentLoaded", async () => {
  const storyContainer = document.getElementById("story-description-container");

  if (!storyContainer) {
    console.error("Story description container not found!");
    return;
  }

  try {
    const response = await fetch("partials/story-description.html");
    if (!response.ok) {
      throw new Error(`Failed to load story description: ${response.status}`);
    }
    const storyHtml = await response.text();
    storyContainer.innerHTML = storyHtml;
    storyContainer.style.display = "none"; // Hide by default
  } catch (error) {
    console.error("Error loading story description:", error);
    storyContainer.innerHTML = '<p style="color: red; text-align: center;">خطأ في تحميل القصة.</p>';
  }
});
