// Import Supabase client
const supabaseClient = supabase.createClient(window.ENV.SUPABASE_URL, window.ENV.SUPABASE_KEY)

// Login page functionality
document.addEventListener("DOMContentLoaded", async () => {
  // Import Supabase client
  const supabase = supabaseClient

  const loginForm = document.getElementById("loginForm")
  const loginButton = document.getElementById("loginButton")
  const errorMessage = document.getElementById("errorMessage")



  if (loginForm) {
    loginForm.addEventListener("submit", loginHandler)
  }

  async function loginHandler(e) {
    e.preventDefault()

    const email = document.getElementById("email").value
    const password = document.getElementById("password").value

    // Show loading state
    if (loginButton) {
      loginButton.textContent = "Signing in..."
      loginButton.disabled = true
    }

    if (errorMessage) {
      errorMessage.style.display = "none"
    }

    try {
      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Redirect to home page on successful login
      window.location.href = "home.html"
    } catch (error) {
      if (errorMessage) {
        errorMessage.textContent = error.message || "Login failed. Please try again."
        errorMessage.style.display = "block"
      }

      if (loginButton) {
        loginButton.textContent = "Sign in"
        loginButton.disabled = false
      }
    }
  }

  // Sign up functionality
  const signupLink = document.querySelector(".signup-link a")
  if (signupLink) {
    signupLink.addEventListener("click", (e) => {
      e.preventDefault()

      // Toggle to signup form
      document.querySelector(".login-title").textContent = "Create an Account"
      document.querySelector(".login-description").textContent = "Sign up to start exploring places around you"
      loginButton.textContent = "Sign up"

      // Change form submission to handle signup
      loginForm.removeEventListener("submit", loginHandler)
      loginForm.addEventListener("submit", signupHandler)
    })
  }

  async function signupHandler(e) {
    e.preventDefault()

    const email = document.getElementById("email").value
    const password = document.getElementById("password").value

    // Show loading state
    loginButton.textContent = "Signing up..."
    loginButton.disabled = true
    errorMessage.style.display = "none"

    try {
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: email.split("@")[0],
          },
        },
      })

      if (error) throw error

      // Create profile entry
      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: data.user.id,
            username: email.split("@")[0],
            full_name: "",
            avatar_url: "",
          },
        ])

        if (profileError) console.error("Error creating profile:", profileError)
      }

      // Show success message
      errorMessage.textContent = "Account created! Please check your email for verification."
      errorMessage.style.display = "block"
      errorMessage.style.backgroundColor = "rgba(34, 197, 94, 0.1)"
      errorMessage.style.color = "#16a34a"

      loginButton.textContent = "Sign in"
      loginButton.disabled = false

      // Reset form to login
      document.querySelector(".login-title").textContent = "Welcome to LocalGuide"
      document.querySelector(".login-description").textContent = "Enter your credentials to access your account"
      loginForm.removeEventListener("submit", signupHandler)
      loginForm.addEventListener("submit", loginHandler)
    } catch (error) {
      errorMessage.textContent = error.message || "Signup failed. Please try again."
      errorMessage.style.display = "block"
      loginButton.textContent = "Sign up"
      loginButton.disabled = false
    }
  }

  // Initialize Lucide icons
  try {
    if (typeof lucide !== "undefined") {
      lucide.createIcons()
    }
  } catch (error) {
    console.error("Lucide is not defined:", error)
  }
})

const lucide = window.lucide
