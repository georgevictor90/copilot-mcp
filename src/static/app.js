document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft =
          details.max_participants - details.participants.length;

        // Create participants HTML with delete icons instead of bullet points
        const participantsHTML =
          details.participants.length > 0
            ? `<div class="participants-section">
              <h5>Participants:</h5>
              <ul class="participants-list">
                ${details.participants
                  .map(
                    (email) =>
                      `<li><span class="participant-email">${email}</span><button class="delete-btn" data-activity="${name}" data-email="${email}">❌</button></li>`
                  )
                  .join("")}
              </ul>
            </div>`
            : `<p><em>No participants yet</em></p>`;

        activityCard.innerHTML = `
          <div class="activity-info">
            <h4>${name}</h4>
            <p>${details.description}</p>
            <p><strong>Schedule:</strong> ${details.schedule}</p>
            <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
            <div class="participants-container">
              ${participantsHTML}
            </div>
          </div>
          <div class="register-section">
            <button class="register-btn" data-activity="${name}">Register Student</button>
            <div class="register-form hidden" data-form="${name}">
              <input type="email" class="email-input" placeholder="student-email@mergington.edu" required />
              <button class="submit-register" data-activity="${name}">Submit</button>
              <button class="cancel-btn" data-activity="${name}">Cancel</button>
            </div>
          </div>
        `;

        activitiesList.appendChild(activityCard);
      });

      // Add event listeners for register buttons
      document.querySelectorAll(".register-btn").forEach((button) => {
        button.addEventListener("click", handleRegisterClick);
      });

      // Add event listeners for submit register buttons
      document.querySelectorAll(".submit-register").forEach((button) => {
        button.addEventListener("click", handleRegisterSubmit);
      });

      // Add event listeners for cancel buttons
      document.querySelectorAll(".cancel-btn").forEach((button) => {
        button.addEventListener("click", handleRegisterCancel);
      });

      // Add event listeners to delete buttons
      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", handleUnregister);
      });
    } catch (error) {
      activitiesList.innerHTML =
        "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle unregister functionality
  async function handleUnregister(event) {
    const button = event.target;
    const activity = button.getAttribute("data-activity");
    const email = button.getAttribute("data-email");

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/unregister?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";

        // Refresh activities list to show updated participants
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to unregister. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error unregistering:", error);
    }
  }

  // Handle register button click
  function handleRegisterClick(event) {
    const button = event.target;
    const activity = button.getAttribute("data-activity");
    const form = document.querySelector(`[data-form="${activity}"]`);
    
    // Hide all other forms
    document.querySelectorAll(".register-form").forEach((f) => {
      if (f !== form) {
        f.classList.add("hidden");
      }
    });
    
    // Toggle this form
    form.classList.toggle("hidden");
  }

  // Handle register cancel
  function handleRegisterCancel(event) {
    const button = event.target;
    const activity = button.getAttribute("data-activity");
    const form = document.querySelector(`[data-form="${activity}"]`);
    const emailInput = form.querySelector(".email-input");
    
    emailInput.value = "";
    form.classList.add("hidden");
  }

  // Handle register submit
  async function handleRegisterSubmit(event) {
    const button = event.target;
    const activity = button.getAttribute("data-activity");
    const form = document.querySelector(`[data-form="${activity}"]`);
    const emailInput = form.querySelector(".email-input");
    const email = emailInput.value;

    if (!email) {
      showMessage("Please enter an email address.", "error");
      return;
    }

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "success");
        emailInput.value = "";
        form.classList.add("hidden");

        // Refresh activities list to show updated participants
        fetchActivities();
      } else {
        showMessage(result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage("Failed to sign up. Please try again.", "error");
      console.error("Error signing up:", error);
    }
  }

  // Helper function to show messages
  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = type;
    messageDiv.classList.remove("hidden");

    // Hide message after 5 seconds
    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }

  // Initialize app
  fetchActivities();
});
