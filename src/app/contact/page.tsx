import { Header } from "@/components/Header";
import { ContactForm } from "@/components/contact/ContactForm";

export default function ContactPage() {
  return (
    <>
      <Header active="/contact" />
      <main>
        <section className="mx-auto max-w-6xl px-5">
          <div className="py-10 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#333] sm:text-4xl">
              Contact Us
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-[#666]">
              Have questions or feedback? We&apos;d love to hear from you!
            </p>
          </div>

          <div className="grid gap-8 pb-12 md:grid-cols-2">
            <div className="flex flex-col gap-6">
              <div className="card">
                <h3 className="mb-4 text-lg font-semibold text-[#333]">Get In Touch</h3>
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <span className="text-primary">✉</span>
                    <div>
                      <h4 className="text-sm font-medium text-[#333]">Email</h4>
                      <p className="text-sm text-[#666]">team4@localguide.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-primary">☎</span>
                    <div>
                      <h4 className="text-sm font-medium text-[#333]">Phone</h4>
                      <p className="text-sm text-[#666]">+91 8263072405</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-primary">◉</span>
                    <div>
                      <h4 className="text-sm font-medium text-[#333]">Office</h4>
                      <p className="text-sm text-[#666]">
                        KIT Collage Of Engineering<br />
                        Kolhapur, Gokul Shirgaon, Maharashtra 416234<br />
                        India
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="mb-4 text-lg font-semibold text-[#333]">Office Hours</h3>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span>9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span>10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span>Closed</span>
                  </div>
                </div>
              </div>
            </div>

            <ContactForm />
          </div>
        </section>
      </main>
    </>
  );
}
