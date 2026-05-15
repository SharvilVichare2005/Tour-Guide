// Contact page functionality
document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"

  // DOM elements
  const contactForm = document.getElementById("contactForm")
  const formContainer = document.getElementById("formContainer")
  const successMessage = document.getElementById("successMessage")
  const submitBtn = document.getElementById("submitBtn")
  const sendAnotherBtn = document.getElementById("sendAnotherBtn")

  // Initialize Lucide icons
  if (typeof lucide === "undefined") {
    window.lucide = {
      createIcons: () => {
        // Placeholder for lucide.createIcons() functionality
        // In a real application, this would initialize the Lucide icons.
        console.warn("Lucide icons not properly initialized. Ensure Lucide library is included.")
      },
    }
  }

  // Form submission
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault()

      // Show loading state
      if (submitBtn) {
        submitBtn.innerHTML = "Sending..."
        submitBtn.disabled = true
      }

      // Simulate API call
      setTimeout(() => {
        // Show success message
        if (formContainer) formContainer.style.display = "none"
        if (successMessage) successMessage.style.display = "flex"

        // Reset form
        contactForm.reset()
      }, 1500)
    })
  }

  // Send another message button
  if (sendAnotherBtn) {
    sendAnotherBtn.addEventListener("click", () => {
      if (successMessage) successMessage.style.display = "none"
      if (formContainer) formContainer.style.display = "block"

      if (submitBtn) {
        submitBtn.innerHTML = '<i data-lucide="send" class="button-icon"></i> Send Message'
        submitBtn.disabled = false
      }

      // Re-initialize Lucide icons
      if (typeof lucide !== "undefined") {
        lucide.createIcons()
      }
    })
  }

  // Initialize Lucide icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons()
  }
})
