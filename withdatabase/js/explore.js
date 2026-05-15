// Import Supabase client from CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm'

// Explore page functionality
document.addEventListener("DOMContentLoaded", async () => {
  // Import Supabase client
  // Import and initialize Supabase client
  const supabase = createClient(
    window.ENV.SUPABASE_URL,
    window.ENV.SUPABASE_KEY
  );


  // DOM elements
  const searchInput = document.getElementById("searchInput")
  const searchBtn = document.getElementById("searchBtn")
  const destinationsGrid = document.getElementById("destinationsGrid")

  // Render destinations from Supabase
  async function renderDestinations() {
    if (!destinationsGrid) return

    try {
      // Fetch destinations from Supabase
      const { data, error } = await supabase.from("destinations").select("*")

      if (error) throw error

      if (data.length === 0) {
        destinationsGrid.innerHTML = '<p class="text-center py-8">No destinations found. Please check back later.</p>'
        return
      }

      let html = ""

      data.forEach((destination, index) => {
        html += `
          <div class="destination-card" data-index="${index}">
            <div class="destination-image-container">
              <img src="${destination.image}" alt="${destination.title}" class="destination-image">
              <div class="destination-overlay">
                <h3 class="destination-title">${destination.title}</h3>
              </div>
            </div>
            <div class="destination-content">
              <p class="destination-description">${destination.description}</p>
              <button class="destination-button" data-index="${index}">
                <i data-lucide="map-pin" class="button-icon"></i>
                Explore
              </button>
            </div>
          </div>
        `
      })

      destinationsGrid.innerHTML = html

      // Initialize Lucide icons for the newly added elements
      if (typeof lucide !== "undefined") {
        lucide.createIcons()
      }

      // Add event listeners to explore buttons
      document.querySelectorAll(".destination-button").forEach((button, index) => {
        button.addEventListener("click", () => {
          navigateToDestination(data[index])
        })
      })

      // Make destination cards clickable
      document.querySelectorAll(".destination-card").forEach((card, index) => {
        card.addEventListener("click", (e) => {
          // Only navigate if the click wasn't on the button (to avoid double navigation)
          if (!e.target.closest(".destination-button")) {
            navigateToDestination(data[index])
          }
        })
      })
    } catch (error) {
      console.error("Error fetching destinations:", error)
      destinationsGrid.innerHTML = `
        <div class="text-center p-4">
          <p class="text-red-500 mb-2">Failed to load destinations. Please try again later.</p>
          <button class="button button-outline" onclick="window.location.reload()">
            Try Again
          </button>
        </div>
      `
    }
  }

  // Navigate to a destination
  function navigateToDestination(destination) {
    // Store the destination location in localStorage
    localStorage.setItem("exploreLocation", JSON.stringify(destination.position))

    // Navigate to home page
    window.location.href = "home.html"
  }

  // Search functionality
  async function handleSearch() {
    if (!searchInput) return

    const query = searchInput.value.trim().toLowerCase()

    if (!query) {
      alert("Please enter a search term")
      return
    }

    try {
      // Search destinations in Supabase
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)

      if (error) throw error

      if (data.length === 0) {
        alert("No matching destinations found. Try searching for Delhi, Mumbai, Jaipur, etc.")
        return
      }

      // Navigate to the first matching destination
      navigateToDestination(data[0])
    } catch (error) {
      console.error("Error searching destinations:", error)
      alert("Search failed. Please try again later.")
    }
  }

  // Event listeners
  if (searchBtn) {
    searchBtn.addEventListener("click", handleSearch)
  }

  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        handleSearch()
      }
    })
  }

  // Initialize page
  await renderDestinations()
})

