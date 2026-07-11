import { Header } from "@/components/Header";
import { MapPin, Users, Globe, Shield } from "lucide-react";

const FEATURES = [
  {
    icon: MapPin,
    title: "Location-Based",
    description:
      "Discover places within 5km of your current location for convenient exploration",
  },
  {
    icon: Users,
    title: "Community-Driven",
    description: "Benefit from real reviews and recommendations from fellow travelers",
  },
  {
    icon: Globe,
    title: "Global Coverage",
    description: "Access information about places of interest worldwide",
  },
  {
    icon: Shield,
    title: "Privacy-Focused",
    description:
      "Your location data is only used to provide recommendations and never shared",
  },
];

export default function AboutPage() {
  return (
    <>
      <Header active="/about" />
      <main>
        <section className="mx-auto max-w-6xl px-5">
          <div className="py-10 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#333] sm:text-4xl">
              About LocalGuide
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-[#666]">
              Discover the story behind our mission to help you explore the world around you
            </p>
          </div>

          <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-center">
            <div className="flex-1">
              <h3 className="mb-3 text-xl font-semibold text-[#333]">Our Mission</h3>
              <p className="mb-3 text-[#666]">
                LocalGuide was founded with a simple mission: to help travelers and locals
                alike discover the hidden gems around them. We believe that every
                neighborhood, every city, and every region has unique experiences waiting to
                be discovered.
              </p>
              <p className="mb-3 text-[#666]">
                Our platform uses advanced location technology to identify the best
                attractions, restaurants, museums, and more within a 5km radius of your
                current location, making exploration easy and accessible to everyone.
              </p>
              <p className="text-[#666]">
                Whether you&apos;re a tourist in a new city or looking to rediscover your
                hometown, LocalGuide is your companion for authentic, personalized
                experiences.
              </p>
            </div>
            <div className="flex-1 overflow-hidden rounded-xl bg-secondary">
              <img
                src="/images/placeholder.jpeg"
                alt="LocalGuide Team"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl bg-white p-6 text-center shadow-card"
              >
                <div className="mb-4 flex justify-center">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-[#333]">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#666]">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="mb-12 rounded-xl bg-white p-8 text-center shadow-card">
            <h3 className="mb-2 text-xl font-semibold text-[#333]">
              Join Our Community
            </h3>
            <p className="mx-auto mb-6 max-w-2xl text-[#666]">
              Become part of our growing community of explorers and contribute to making
              travel more accessible and enjoyable for everyone.
            </p>
            <a href="/login" className="btn-primary">
              Get Started
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
