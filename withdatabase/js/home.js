// Import Supabase client from CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm'

// Global variables - keep these at the top level
let map;
let markers = [];
let userLocation;
let userMarker;
let radiusCircle;
let places = [];
let selectedPlace = null;
let currentInfoWindow = null;
let modalMap;
const allPlaces = [];
let directionsRenderer;
let directionsService;

// Combine all initialization into one DOMContentLoaded event
document.addEventListener("DOMContentLoaded", async () => {
    const supabase = createClient(
        window.ENV.SUPABASE_URL,
        window.ENV.SUPABASE_KEY
    );

    // Fetch places from Supabase
    const { data, error } = await supabase.from("places").select("*");
    if (error) {
        console.error("Error fetching places:", error);
        displayPlaces([]); // Show "No places found"
    } else {
        places = data || [];
        displayPlaces(places); // Show places in sidebar
        addMarkersToMap(places); // Add markers to map
    }

    // Initialize UI elements and event listeners
    initializeUI();
});

// Initialize UI elements and event listeners
function initializeUI() {
    // Initialize variables
    const activeTab = "all"

    // DOM elements
    const nearbyPlacesContainer = document.getElementById("nearbyPlaces")
    const mapContainer = document.getElementById("map")
    const centerMapBtn = document.getElementById("centerMapBtn")
    const placeDetailModal = document.getElementById("placeDetailModal")
    const categoryButtons = document.querySelectorAll(".category-btn")

    // Modal elements
    const placeName = document.getElementById("placeName")
    const placeImage = document.getElementById("placeImage")
    const placeRating = document.getElementById("placeRating")
    const placeType = document.getElementById("placeType")
    const placeDescription = document.getElementById("placeDescription")
    const placeVicinity = document.getElementById("placeVicinity")
    const placeHoursContainer = document.getElementById("placeHoursContainer")
    const placeHours = document.getElementById("placeHours")
    const placePhoneContainer = document.getElementById("placePhoneContainer")
    const placePhone = document.getElementById("placePhone")
    const placeWebsiteContainer = document.getElementById("placeWebsiteContainer")
    const placeWebsite = document.getElementById("placeWebsite")
    const placePhotos = document.getElementById("placePhotos")
    const noPhotos = document.getElementById("noPhotos")
    const placeMap = document.getElementById("placeMap")
    const getDirectionsBtn = document.getElementById("getDirectionsBtn")
    const saveBtn = document.getElementById("saveBtn")
    const modalCloseBtn = document.querySelector(".modal-close")
    const tabTriggers = document.querySelectorAll(".tab-trigger")
    const tabContents = document.querySelectorAll(".tab-content")

    // Event listeners
    if (centerMapBtn) {
        centerMapBtn.addEventListener("click", () => {
            if (userLocation && map) {
                map.setCenter(userLocation)
                map.setZoom(14)
            }
        })
    }

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener("click", () => {
            const modal = document.getElementById("placeDetailModal")
            if (modal) modal.classList.remove("active")
        })
    }

    // Modal tab functionality (Info / Photos / Map)
    const modalTabTriggers = document.querySelectorAll('#placeDetailModal .tab-trigger')
    modalTabTriggers.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            const modal = document.getElementById('placeDetailModal')
            if (!modal) return

            // Remove active state from all modal tab triggers inside this modal
            modal.querySelectorAll('.tab-trigger').forEach(t => t.classList.remove('active'))
            btn.classList.add('active')

            // Hide all tab contents inside modal
            modal.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'))

            const tabName = btn.getAttribute('data-tab')
            const targetId = tabName + 'Tab'
            const target = document.getElementById(targetId)
            if (target) target.classList.add('active')

            // If map tab shown, trigger a resize on the small modal map so it renders correctly
            if (tabName === 'map') {
                setTimeout(() => {
                    const modalMapEl = document.getElementById('modalMap')
                    if (modalMapEl && window.google && window.google.maps) {
                        try {
                            // If a map instance exists for modalMap, trigger resize by creating a new map or calling google.maps.event.trigger
                            // We'll attempt to trigger a resize event (if a map instance was stored globally as modalMap)
                            if (typeof modalMap !== 'undefined' && modalMap) {
                                google.maps.event.trigger(modalMap, 'resize')
                                modalMap.setCenter({ lat: modalMap.getCenter().lat(), lng: modalMap.getCenter().lng() })
                            } else {
                                // If modalMap instance not stored, try to initialize it here using selectedPlace
                                if (selectedPlace && selectedPlace.location) {
                                    modalMap = new google.maps.Map(modalMapEl, { center: selectedPlace.location, zoom: 15 })
                                    new google.maps.Marker({ position: selectedPlace.location, map: modalMap })
                                }
                            }
                        } catch (err) {
                            console.warn('Error resizing/initializing modal map:', err)
                        }
                    }
                }, 200)
            }
        })
    })

    // Close modal when clicking outside
    window.addEventListener("click", (e) => {
        const modal = document.getElementById("placeDetailModal")
        if (e.target === modal) {
            modal.classList.remove("active")
        }
    })

    // Save button functionality
    if (saveBtn) {
        saveBtn.addEventListener("click", async () => {
            if (!selectedPlace) return

            try {
                // Check if already saved
                const { data: existingSave, error: checkError } = await supabase
                    .from("saved_places")
                    .select("*")
                    .eq("user_id", session.user.id)
                    .eq("place_id", selectedPlace.id)
                    .single()

                if (checkError && checkError.code !== "PGRST116") {
                    throw checkError
                }

                if (existingSave) {
                    // Remove from saved places
                    const { error: deleteError } = await supabase
                        .from("saved_places")
                        .delete()
                        .eq("user_id", session.user.id)
                        .eq("place_id", selectedPlace.id)

                    if (deleteError) throw deleteError

                    saveBtn.textContent = "Save"
                    saveBtn.classList.remove("saved")
                    alert("Removed from saved places")
                } else {
                    // Add to saved places
                    const { error: insertError } = await supabase.from("saved_places").insert([
                        {
                            user_id: session.user.id,
                            place_id: selectedPlace.id,
                        },
                    ])

                    if (insertError) throw insertError

                    saveBtn.textContent = "Saved"
                    saveBtn.classList.add("saved")
                    alert("Added to saved places!")
                }
            } catch (error) {
                console.error("Error saving place:", error)
                alert("Failed to save place. Please try again.")
            }
        })
    }

    // Get directions button
    if (getDirectionsBtn) {
        getDirectionsBtn.addEventListener("click", () => {
            if (selectedPlace && selectedPlace.location) {
                const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.location.lat},${selectedPlace.location.lng}`
                window.open(url, "_blank")
            }
        })
    }
}


function loadGoogleMapsApi(apiKey) {
    return new Promise((resolve, reject) => {
        if (window.google && window.google.maps) {
            resolve(window.google.maps);
            return;
        }
        window._mapsCallback = () => resolve(window.google.maps);
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&loading=async&callback=_mapsCallback`;
        script.async = true;
        script.defer = true;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

async function initMap() {
    const mapElement = document.getElementById("map");
    if (!mapElement) {
        console.error("Map element not found");
        return;
    }
    const defaultLocation = { lat: 16.653957, lng: 74.262214 };
    // assign to global `map` so other functions can use it
    map = new google.maps.Map(mapElement, {
        center: defaultLocation,
        zoom: 13,
        mapId: "2cca67fe0b4a99f3f7e0c145" // <-- Add your Map ID here
    });

    // Use AdvancedMarkerElement to show a default marker
    const { AdvancedMarkerElement } = google.maps.marker;
    new AdvancedMarkerElement({
        map: map,
        position: defaultLocation,
        title: "Default Location",
    });

    // Try to get user's location and add a user marker (non-blocking)
    try {
        const position = await getCurrentPosition();
        userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        map.setCenter(userLocation);
        map.setZoom(14);

        // Remove previous user marker if it exists
        if (userMarker) {
            userMarker.setMap(null);
        }
        // Add a marker for the user's location
        userMarker = new google.maps.Marker({
            position: userLocation,
            map: map,
            title: "Your Location",
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: "white"
            }
        });
    } catch (error) {
        console.warn('Error getting location in initMap:', error);
    }
}

// Usage: call this when DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
    try {
        await loadGoogleMapsApi("AIzaSyByvZ_6ArXJwbZLBcC8qkShGFVDD_2UcGI");
        initMap();
    } catch (error) {
        console.error("Failed to load Google Maps:", error);
        showMapError();
    }
});


// Make initMap globally available for Google Maps API callback
window.initMap = initMap;

async function initializeMapWithLocation(location) {
    // Create map
    console.log("initializing map ....");
    map = new google.maps.Map(document.getElementById('map'), {
        center: location,
        zoom: 5,
        styles: [], // Add custom styles if needed
        mapTypeControl: false,
        fullscreenControl: false
    });

    // Try to get user's location
    try {
        const position = await getCurrentPosition();
        userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        map.setCenter(userLocation);
        map.setZoom(14);
        // Remove previous user marker if it exists
        if (userMarker) {
            userMarker.setMap(null);
        }
        // Add a marker for the user's location using classic Marker
        userMarker = new google.maps.Marker({
            position: userLocation,
            map: map,
            title: "Your Location",
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: "white"
            }
        });
    } catch (error) {
        console.warn('Error getting location:', error);
    }

    // Initialize map controls
    setupMapControls();
}

function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
        }
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

function setupMapControls() {
    const centerMapBtn = document.getElementById('centerMapBtn');
    if (centerMapBtn) {
        centerMapBtn.addEventListener('click', async () => {
            try {
                const position = await getCurrentPosition();
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                map.setCenter(userLocation);
                map.setZoom(14);
                // Remove previous user marker if it exists
                if (userMarker) {
                    userMarker.setMap(null);
                }
                // Add a marker for the user's location using classic Marker
                userMarker = new google.maps.Marker({
                    position: userLocation,
                    map: map,
                    title: "Your Location",
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: "#4285F4",
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: "white"
                    }
                });
            } catch (error) {
                console.warn('Error getting location:', error);
            }
        });
    }
}

// Show loading indicator
function showLoadingIndicator() {
    const mapElement = document.getElementById("map");
    if (mapElement) {
        mapElement.innerHTML = `
            <div class="loading">
                <i data-lucide="loader-2" class="loading-icon"></i>
                <span>Loading map...</span>
            </div>
        `;
    }
}

// Call this before loading the map
showLoadingIndicator();

document.addEventListener("DOMContentLoaded", () => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"

    // Place detail modal
    const modal = document.getElementById("placeDetailModal")
    const closeModal = document.getElementById("closeModal")

    // Close modal when clicking the close button
    if (closeModal) {
        closeModal.addEventListener("click", () => {
            modal.classList.remove("active")
        })
    }

    // Close modal when clicking outside the modal content
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.classList.remove("active")
        }
    })

    // Tab functionality
    const tabs = document.querySelectorAll(".tab")
    tabs.forEach((tab) => {
        tab.addEventListener("click", function () {
            // Remove active class from all tabs and tab contents
            document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"))
            document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"))

            // Add active class to clicked tab and corresponding content
            this.classList.add("active")
            const tabId = this.getAttribute("data-tab") + "Tab"
            document.getElementById(tabId).classList.add("active")
        })
    })

    // Category buttons
    const categoryButtons = document.querySelectorAll(".category-button")
    categoryButtons.forEach((button) => {
        button.addEventListener("click", function () {
            const category = this.getAttribute("data-category")
            filterPlacesByCategory(category)
        })
    })
})

// Global variables
let circle

// Default location (kolhapur Institute of Technology, India)
const defaultLocation = { lat: 16.653957, lng: 74.262214 }

function filterPlacesByCategory(category) {
    if (category === "all") {
        displayPlaces(places)
        addMarkersToMap(places)
    } else {
        const filteredPlaces = places.filter((place) => place.type === category)

        if (filteredPlaces.length === 0) {
            const placesList = document.getElementById("places-list")
            placesList.innerHTML = '<p class="text-center text-muted py-4">No places found in this category</p>'

            // Clear markers
            markers.forEach((marker) => marker.setMap(null))
            markers = []
        } else {
            // Update the places list with filtered places
            const placesList = document.getElementById("places-list")
            placesList.innerHTML = ""

            filteredPlaces.forEach((place) => {
                const placeItem = document.createElement("div")
                placeItem.className = "place-item"
                placeItem.innerHTML = `
                    <img src="${place.image}" alt="${place.name}" class="place-image">
                    <div class="place-content">
                        <h4 class="place-name">${place.name}</h4>
                        <div class="place-info">
                            <i data-lucide="star" class="star-icon"></i>
                            <span>${place.rating}</span>
                            <span class="place-type">${place.type}</span>
                        </div>
                        <div class="place-location">
                            <i data-lucide="map-pin" class="info-icon"></i>
                            <span>${place.vicinity}</span>
                        </div>
                    </div>
                    <div class="place-distance">${place.distance} km</div>
                `

                // Add click event to show place details and directions
                placeItem.addEventListener("click", () => {
                    showPlaceDetails(place);
                    // show route from user's current location to this place
                    showDirectionsOnMap(place.location);
                })

                placesList.appendChild(placeItem)
            })

            // Update markers
            addMarkersToMap(filteredPlaces)
        }

        // Re-initialize Lucide icons
        if (typeof lucide !== "undefined") {
            lucide.createIcons()
        }
    }
}

function addMarkersToMap(places) {
    // Clear existing markers
    markers.forEach((marker) => marker.setMap(null))
    markers = []

    // Add new markers
    places.forEach((place) => {
        const { AdvancedMarkerElement } = google.maps.marker;
        const marker = new AdvancedMarkerElement({
            position: place.location,
            map: map,
            title: place.name,
        });


        // Add click event to marker: show details and directions
        marker.addListener("click", () => {
            showPlaceDetails(place)
            showDirectionsOnMap(place.location)
        })

        markers.push(marker)
    })
}

function displayPlaces(places) {
    const nearbyPlacesElement = document.getElementById("nearbyPlaces")
    if (!nearbyPlacesElement) return

    nearbyPlacesElement.innerHTML = ""

    if (places.length === 0) {
        nearbyPlacesElement.innerHTML =
            '<p class="text-center text-muted-foreground py-4">No places found in this category</p>'
        return
    }

    // Create tabs
    const tabsHtml = `
        <div class="tab">
            <div class="tab-list">
                <button class="tab-trigger active" data-filter="all">All</button>
                <button class="tab-trigger" data-filter="restaurant">Food</button>
                <button class="tab-trigger" data-filter="attraction">Sights</button>
                <button class="tab-trigger" data-filter="temple">Temples</button>
            </div>
            <div id="places-list" class="places-list"></div>
        </div>
    `

    nearbyPlacesElement.innerHTML = tabsHtml
    const placesList = document.getElementById("places-list")

    places.forEach((place) => {
        const placeItem = document.createElement("div")
        placeItem.className = "place-item"
        placeItem.innerHTML = `
            <div class="place-card-mini">
                <img src="${place.image}" alt="${place.name}" class="place-thumb">
                <div class="place-card-body">
                    <div class="place-card-header">
                        <h4 class="place-name">${place.name}</h4>
                        <div class="rating-badge"><i data-lucide="star" class="star-icon"></i><span>${place.rating}</span></div>
                    </div>
                    <div class="place-meta">
                        <span class="place-type small">${place.type}</span>
                        <span class="place-vicinity small">• ${place.vicinity}</span>
                    </div>
                    <div class="place-actions-row">
                        <button class="view-btn">View</button>
                        <span class="place-distance">${place.distance ?? '—'} km</span>
                    </div>
                </div>
            </div>
        `

        // Add click event to show place details and directions
        placeItem.addEventListener("click", () => {
            showPlaceDetails(place)
            showDirectionsOnMap(place.location)
        })

        placesList.appendChild(placeItem)
    })

    // Add event listeners to filter tabs (scope them to the nearbyPlaces container so modal buttons aren't affected)
    if (nearbyPlacesElement) {
        nearbyPlacesElement.querySelectorAll(".tab-trigger").forEach((tab) => {
            tab.addEventListener("click", () => {
                // Update active tab within the nearbyPlaces area
                nearbyPlacesElement.querySelectorAll(".tab-trigger").forEach((t) => t.classList.remove("active"))
                tab.classList.add("active")

                const filter = tab.getAttribute("data-filter")
                filterPlacesByCategory(filter)
            })
        })
    }

    // Re-initialize Lucide icons
    if (typeof lucide !== "undefined") {
        lucide.createIcons()
    }
}

async function showPlaceDetails(place) {
    selectedPlace = place

    // Set modal content
    const modal = document.getElementById("placeDetailModal")
    if (!modal) return

    document.getElementById("modalTitle").textContent = place.name
    document.getElementById("modalRating").textContent = place.rating
    document.getElementById("modalType").textContent = place.type
    document.getElementById("modalImage").src = place.image
    document.getElementById("modalDescription").textContent = place.description || "No description available."
    document.getElementById("modalVicinity").textContent = place.vicinity

    // Hours
    const hoursContainer = document.getElementById("hoursContainer")
    const hoursElement = document.getElementById("modalHours")
    if (place.hours && place.hours.length > 0) {
        hoursContainer.style.display = "flex"
        hoursElement.innerHTML = ""
        place.hours.forEach((hour) => {
            const hourDiv = document.createElement("div")
            hourDiv.textContent = hour
            hoursElement.appendChild(hourDiv)
        })
    } else {
        hoursContainer.style.display = "none"
    }

    // Phone
    const phoneContainer = document.getElementById("phoneContainer")
    const phoneElement = document.getElementById("modalPhone")
    if (place.phone) {
        phoneContainer.style.display = "flex"
        phoneElement.textContent = place.phone
        phoneElement.href = `tel:${place.phone}`
    } else {
        phoneContainer.style.display = "none"
    }

    // Website
    const websiteContainer = document.getElementById("websiteContainer")
    const websiteElement = document.getElementById("modalWebsite")
    if (place.website) {
        websiteContainer.style.display = "flex"
        websiteElement.textContent = place.website.replace(/^https?:\/\//, "")
        websiteElement.href = place.website
    } else {
        websiteContainer.style.display = "none"
    }

    // Photos
    const photosElement = document.getElementById("modalPhotos")
    const photosTabEl = document.getElementById("photosTab")
    if (place.photos && place.photos.length > 0) {
        if (photosElement) {
            photosElement.innerHTML = ""
            place.photos.forEach((photo) => {
                const img = document.createElement("img")
                img.src = photo
                img.alt = `${place.name} photo`
                img.className = "photo"
                photosElement.appendChild(img)
            })
            if (photosTabEl) photosTabEl.innerHTML = '<div class="photos-grid">' + photosElement.innerHTML + "</div>"
        } else {
            if (photosTabEl) photosTabEl.innerHTML = '<div class="photos-grid">' + place.photos.map(p => `<img src="${p}" class="photo">`).join("") + "</div>"
            else console.warn('photosTab and modalPhotos elements are missing')
        }
    } else {
        if (photosTabEl) {
            photosTabEl.innerHTML = '<p class="text-center text-muted-foreground py-8">No photos available</p>'
        } else {
            console.warn('photosTab element is missing')
        }
    }

    // Map view in modal
    const mapTab = document.getElementById("modalMapView")
    if (mapTab) {
        mapTab.innerHTML = '<div id="modalMap" style="width:100%;height:200px;"></div>'
    } else {
        console.warn('modalMapView element not found')
    }

    // Check if place is saved by user (guarded)
    try {
        if (typeof supabase !== 'undefined' && typeof session !== 'undefined' && session?.user?.id) {
            const { data: savedPlace, error } = await supabase
                .from("saved_places")
                .select("*")
                .eq("user_id", session.user.id)
                .eq("place_id", place.id)
                .single()

            const saveButton = document.getElementById("saveBtn")
            if (saveButton) {
                if (savedPlace) {
                    saveButton.textContent = "Saved"
                    saveButton.classList.add("saved")
                } else {
                    saveButton.textContent = "Save"
                    saveButton.classList.remove("saved")
                }
            }
        }
    } catch (err) {
        console.warn('Could not check saved_place status:', err)
    }

    // Show modal
    modal.classList.add("active")

    // Initialize small map in modal after it's visible
    setTimeout(() => {
        const modalMap = new google.maps.Map(document.getElementById("modalMap"), {
            center: place.location,
            zoom: 15,
        })

        new google.maps.Marker({
            position: place.location,
            map: modalMap,
            title: place.name,
        })

        const { AdvancedMarkerElement } = google.maps.marker;
        new AdvancedMarkerElement({
            map: modalMap,
            position: place.location,
            title: place.name,
        });
    }, 300)
}


// Error handling function
function showMapError() {
    const mapElement = document.getElementById('map');
    if (mapElement) {
        mapElement.innerHTML = `
            <div class="error-message">
                <i data-lucide="alert-triangle" class="error-icon"></i>
                <p>Failed to load the map. Please try again later.</p>
            </div>
        `;
    }
}

async function showDirectionsOnMap(destination) {
    // If map isn't available, nothing to render on — open external Maps
    if (!map) {
        const urlNoMap = `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}`
        window.open(urlNoMap, "_blank")
        return
    }

    // If user location is not available, open Google Maps directions (browser/device will use current location)
    if (!userLocation) {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}`
        window.open(url, "_blank")
        return
    }

    // Initialize DirectionsService and DirectionsRenderer if not already
    try {
        if (!directionsService) directionsService = new google.maps.DirectionsService();
        if (!directionsRenderer) {
            directionsRenderer = new google.maps.DirectionsRenderer();
            directionsRenderer.setMap(map);
        }

        const request = {
            origin: userLocation,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING
        };

        directionsService.route(request, (result, status) => {
            // Use string status comparison for compatibility with different Maps SDK versions
            if (status === 'OK' || status === google.maps.DirectionsStatus?.OK) {
                directionsRenderer.setDirections(result);
            } else {
                console.warn('Directions request failed, falling back to external Maps URL. Status:', status)
                // Fallback: open Google Maps directions URL in a new tab
                const originParam = `${userLocation.lat},${userLocation.lng}`
                const destParam = `${destination.lat},${destination.lng}`
                const url = `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${destParam}`
                window.open(url, "_blank")
            }
        });
    } catch (err) {
        console.error('Directions failed:', err)
        // Fallback to external Maps URL
        const originParam = `${userLocation.lat},${userLocation.lng}`
        const destParam = `${destination.lat},${destination.lng}`
        const url = `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${destParam}`
        window.open(url, "_blank")
    }
}

