// src/components/landing/TrustedBy.tsx
export const TrustedBy = () => {
  // In a real project, these would be <Image> components with the actual logos.
  const partners = [
    "Ghana Education Service",
    "National Council For Curriculum Assessment",
    "T-TEL",
    "Art In The Round",
    "Ministry of Education",
  ];

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto">
        <h3 className="text-center text-sm font-bold text-slate-500 uppercase tracking-widest">
          Trusted by Leading Industry Partners
        </h3>
        <div className="mt-6 flex flex-wrap justify-center items-center gap-x-12 gap-y-4">
          {partners.map((partner) => (
            <div
              key={partner}
              className="text-lg font-semibold text-slate-400 grayscale hover:grayscale-0 transition-all"
            >
              {partner}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
