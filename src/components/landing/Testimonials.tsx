// src/components/landing/Testimonials.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Mrs. Adjoa Mensah",
    title: "SHS Teacher, Accra",
    quote:
      "LearnBridgeEdu has given me my weekends back. What used to take hours of planning now takes minutes. The RAG-powered lesson plans are perfectly aligned with the SBC. It's a game-changer.",
    avatar: "https://i.pravatar.cc/150?u=adjoa",
  },
  {
    name: "Kwesi Appiah",
    title: "Form 2 Student, Kumasi",
    quote:
      "The AI tutor is amazing! Whenever I'm stuck on a science topic, I get an instant explanation. Plus, the Study Circles help me connect with classmates to solve tough problems together.",
    avatar: "https://i.pravatar.cc/150?u=kwesi",
  },
  {
    name: "Dr. Evelyn Addo",
    title: "Curriculum Director, GES (Pilot Program)",
    quote:
      "The analytics dashboard provides an unprecedented, anonymized view into curriculum engagement across regions. This data is invaluable for future policy and resource allocation. A truly innovative platform.",
    avatar: "https://i.pravatar.cc/150?u=evelyn",
  },
];

export const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20 md:py-24 bg-slate-100">
      <div className="container mx-auto">
        <div className="text-center">
          <h2 className="font-serif text-4xl font-bold text-brand-blue">
            Trusted by Educators and Students Across Ghana
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what real users are saying.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.name}
              className="bg-white flex flex-col justify-between shadow-lg"
            >
              <CardContent className="pt-6">
                <p className="text-slate-700 italic">"{testimonial.quote}"</p>
              </CardContent>
              <div className="p-6 bg-slate-50 flex items-center space-x-4">
                <Avatar>
                  <AvatarImage
                    src={testimonial.avatar}
                    alt={testimonial.name}
                  />
                  <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-brand-blue">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-slate-500">{testimonial.title}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
