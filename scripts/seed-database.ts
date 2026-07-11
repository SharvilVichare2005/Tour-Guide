import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add them to .env.local.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const places = [
  {
    name: "India Gate",
    type: "attraction",
    rating: 4.7,
    image: "/images/india_gate/india-gate.jpg",
    vicinity: "Rajpath, New Delhi",
    description:
      "India Gate is a war memorial located in New Delhi. It was built to honor the soldiers of the British Indian Army who died in the First World War and the Third Anglo-Afghan War.",
    location: { lat: 28.612912, lng: 77.22951 },
    hours: ["Open 24 hours"],
    phone: "+91 11 2336 5358",
    website:
      "https://www.delhitourism.gov.in/delhitourism/tourist_place/india_gate.jsp",
    photos: [
      "/images/india_gate/india-gate-1.jpg",
      "/images/india_gate/india-gate-2.jpg",
      "/images/india_gate/india-gate-3.jpg",
      "/images/india_gate/india-gate-4.jpg",
    ],
  },
  {
    name: "Qutub Minar",
    type: "attraction",
    rating: 4.6,
    image: "/images/Qutub_Minar/qutub-minar.jpg",
    vicinity: "Mehrauli, New Delhi",
    description:
      "Qutub Minar is a 73-meter tall minaret built in 1193 by Qutab-ud-din Aibak. It's a UNESCO World Heritage Site and one of Delhi's most iconic monuments.",
    location: { lat: 28.524475, lng: 77.185891 },
    hours: ["Monday - Sunday: 7:00 AM - 5:00 PM"],
    phone: "+91 11 2469 8431",
    website: "https://asi.nic.in/qutub-minar/",
    photos: [
      "/images/Qutub_Minar/qutub-minar-1.jpg",
      "/images/Qutub_Minar/qutub-minar-2.jpg",
      "/images/Qutub_Minar/qutub-minar-3.jpg",
    ],
  },
  {
    name: "Karim's",
    type: "restaurant",
    rating: 4.5,
    image: "/images/Karim's/karims.jpeg",
    vicinity: "16, Gali Kababian, Jama Masjid, Old Delhi",
    description:
      "Karim's is a historic restaurant in Old Delhi, famous for its Mughlai cuisine. Founded in 1913, it's known for its kebabs, biryanis, and curries.",
    location: { lat: 28.650946, lng: 77.233318 },
    hours: ["Monday - Sunday: 11:00 AM - 11:00 PM"],
    phone: "+91 11 2326 9880",
    website: "https://www.karimhoteldelhi.com",
    photos: ["/images/Karim's/karims-1.jpeg", "/images/Karim's/karims-2.jpg"],
  },
  {
    name: "Humayun's Tomb",
    type: "attraction",
    rating: 4.7,
    image: "/images/Humayun's Tomb/humayun-tomb-2.jpg",
    vicinity: "Mathura Road, Nizamuddin, New Delhi",
    description:
      "Humayun's Tomb is the tomb of the Mughal Emperor Humayun. Built in 1570, it was the first garden-tomb on the Indian subcontinent and inspired several architectural innovations, including the Taj Mahal.",
    location: { lat: 28.593166, lng: 77.250941 },
    hours: ["Daily: 6:00 AM - 6:00 PM"],
    phone: "+91 11 2435 5275",
    website: "https://asi.nic.in/humayuns-tomb/",
    photos: [
      "/images/Humayun's Tomb/humayun-tomb-1.jpeg",
      "/images/Humayun's Tomb/humayun-tomb-2.jpg",
      "/images/Humayun's Tomb/humayun-tomb-3.jpg",
    ],
  },
  {
    name: "Indian Accent",
    type: "restaurant",
    rating: 4.8,
    image: "/images/Indian Accent/indian-accent.jpg",
    vicinity: "The Lodhi, Lodhi Road, New Delhi",
    description:
      "Indian Accent is an award-winning restaurant that offers an inventive approach to Indian cuisine. It has been featured in the World's 50 Best Restaurants list.",
    location: { lat: 28.590605, lng: 77.22744 },
    hours: ["Monday - Sunday: 12:00 PM - 2:30 PM, 7:00 PM - 10:30 PM"],
    phone: "+91 11 6617 5151",
    website: "https://indianaccent.com/newdelhi",
    photos: [
      "/images/Indian Accent/indian-accent-1.jpg",
      "/images/Indian Accent/indian-accent-2.avif",
      "/images/Indian Accent/indian-accent-3.jpg",
    ],
  },
  {
    name: "Lodhi Gardens",
    type: "park",
    rating: 4.6,
    image: "/images/Lodhi Gardens/lodhi-garden.jpg",
    vicinity: "Lodhi Road, New Delhi",
    description:
      "Lodhi Gardens is a city park spread over 90 acres containing the tombs of Sayyid and Lodhi rulers. The gardens are a popular spot for morning walks, picnics, and historical exploration.",
    location: { lat: 28.593177, lng: 77.220179 },
    hours: ["Daily: 5:00 AM - 8:00 PM"],
    phone: "+91 11 2464 0079",
    website:
      "https://www.delhitourism.gov.in/delhitourism/tourist_place/lodhi_garden.jsp",
    photos: [
      "/images/Lodhi Gardens/lodhi-garden-1.jpg",
      "/images/Lodhi Gardens/lodhi-garden-2.jpg",
      "/images/Lodhi Gardens/lodhi-garden-3.jpg",
    ],
  },
  {
    name: "Akshardham Temple",
    type: "temple",
    rating: 4.8,
    image: "/images/Akshardham Temple/akshardham.jpg",
    vicinity: "Noida Mor, Pandav Nagar, New Delhi",
    description:
      "Akshardham is a Hindu temple complex that displays millennia of traditional Indian and Hindu culture, spirituality, and architecture. The main monument is built of pink sandstone and white marble.",
    location: { lat: 28.622905, lng: 77.277629 },
    hours: ["Tuesday - Sunday: 9:30 AM - 6:30 PM", "Monday: Closed"],
    phone: "+91 11 4344 2344",
    website: "https://akshardham.com",
    photos: [
      "/images/Akshardham Temple/akshardham-1.jpg",
      "/images/Akshardham Temple/akshardham-2.jpg",
      "/images/Akshardham Temple/akshardham-3.jpg",
      "/images/Akshardham Temple/akshardham-4.jpg",
    ],
  },
  {
    name: "Blue Tokai Coffee Roasters",
    type: "cafe",
    rating: 4.5,
    image: "/images/Blue Tokai Coffee Roasters/blue-tokai.jpg",
    vicinity: "Chhattarpur, New Delhi",
    description:
      "Blue Tokai Coffee Roasters is a specialty coffee shop that sources beans from Indian estates and roasts them in-house. They offer a variety of brewing methods and light food options.",
    location: { lat: 28.629177, lng: 77.219493 },
    hours: ["Monday - Sunday: 8:00 AM - 10:00 PM"],
    phone: "+91 11 4949 4225",
    website: "https://bluetokaicoffee.com",
    photos: [
      "/images/Blue Tokai Coffee Roasters/blue-tokai-1.jpg",
      "/images/Blue Tokai Coffee Roasters/blue-tokai-2.jpg",
      "/images/Blue Tokai Coffee Roasters/blue-tokai-3.jpg",
    ],
  },
];

const destinations = [
  {
    title: "Delhi",
    image: "/images/placeholder.jpeg",
    description:
      "Explore the vibrant capital city with its rich history and monuments",
    position: { lat: 28.6139, lng: 77.209 },
  },
  {
    title: "Mumbai",
    image: "/images/placeholder.jpeg",
    description: "Discover the bustling financial capital and home of Bollywood",
    position: { lat: 19.076, lng: 72.8777 },
  },
  {
    title: "Jaipur",
    image: "/images/placeholder.jpeg",
    description: "Experience the Pink City with its stunning palaces and forts",
    position: { lat: 26.9124, lng: 75.7873 },
  },
  {
    title: "Agra",
    image: "/images/placeholder.jpeg",
    description: "Visit the iconic Taj Mahal and other Mughal architectural wonders",
    position: { lat: 27.1767, lng: 78.0081 },
  },
  {
    title: "Varanasi",
    image: "/images/placeholder.jpeg",
    description:
      "Immerse yourself in the spiritual heart of India on the banks of the Ganges",
    position: { lat: 25.3176, lng: 82.9739 },
  },
  {
    title: "Goa",
    image: "/images/placeholder.jpeg",
    description:
      "Relax on beautiful beaches and enjoy the unique Indo-Portuguese culture",
    position: { lat: 15.2993, lng: 74.124 },
  },
];

async function seed() {
  console.log("Seeding places…");
  const { error: placesError } = await supabase
    .from("places")
    .upsert(places, { onConflict: "name" });
  if (placesError) {
    console.error("Error seeding places:", placesError.message);
  } else {
    console.log(`✓ Places seeded (${places.length})`);
  }

  console.log("Seeding destinations…");
  const { error: destError } = await supabase
    .from("destinations")
    .upsert(destinations, { onConflict: "title" });
  if (destError) {
    console.error("Error seeding destinations:", destError.message);
  } else {
    console.log(`✓ Destinations seeded (${destinations.length})`);
  }

  console.log("Done.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
