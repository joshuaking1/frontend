// src/components/landing/Footer.tsx

export const Footer = () => {
  return (
    <footer className="bg-brand-blue text-white">
      <div className="container mx-auto py-12 grid md:grid-cols-4 gap-8">
        {/* Logo & Copyright */}
        <div className="space-y-4">
          <h3 className="font-serif text-2xl">LearnBridgeEdu</h3>
          <p className="text-slate-300">
            Transforming education in Ghana, one lesson at a time.
          </p>
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} LearnBridgeEdu. All Rights Reserved.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold mb-4">Platform</h4>
          <ul className="space-y-2">
            <li>
              <a href="#features" className="text-slate-300 hover:text-white">
                Features
              </a>
            </li>
            <li>
              <a href="#pricing" className="text-slate-300 hover:text-white">
                Pricing
              </a>
            </li>
            <li>
              <a href="#" className="text-slate-300 hover:text-white">
                Sign In
              </a>
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 className="font-semibold mb-4">Resources</h4>
          <ul className="space-y-2">
            <li>
              <a href="#" className="text-slate-300 hover:text-white">
                Blog
              </a>
            </li>
            <li>
              <a href="#" className="text-slate-300 hover:text-white">
                Help Center
              </a>
            </li>
            <li>
              <a href="#" className="text-slate-300 hover:text-white">
                Contact Us
              </a>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-semibold mb-4">Legal</h4>
          <ul className="space-y-2">
            <li>
              <a href="#" className="text-slate-300 hover:text-white">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="text-slate-300 hover:text-white">
                Terms of Service
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};
