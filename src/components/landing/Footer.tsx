// src/components/landing/Footer.tsx
import Image from "next/image";

export const Footer = () => {
  return (
    <footer className="bg-brand-blue text-white px-4">
      <div className="container mx-auto py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Logo & Copyright */}
          <div className="space-y-3 sm:space-y-4 text-center sm:text-left md:col-span-1">
            <img
              src="/logo-simple.svg"
              alt="LearnBridge"
              className="h-8 w-auto mx-auto sm:mx-0"
            />
            <h3 className="font-serif text-xl sm:text-2xl">LearnBridgeEdu</h3>
            <p className="text-slate-300 text-sm sm:text-base">
              Transforming education in Ghana, one lesson at a time.
            </p>
            <p className="text-slate-400 text-xs sm:text-sm">
              © {new Date().getFullYear()} LearnBridgeEdu. All Rights Reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
              Platform
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#features"
                  className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="/auth/sign-in"
                  className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base"
                >
                  Sign In
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="text-center sm:text-left">
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
              Resources
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="text-center sm:text-left">
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};
