import Link from "next/link";
import { FaTwitter, FaLinkedin, FaGithub, FaYoutube } from "react-icons/fa";

function SocialLinks({ className }: { className?: string }) {
  return (
    <div className={`flex ${className}`}>
      {[
        { icon: FaYoutube, href: "https://youtube.com/@dialwiseai" },
        { icon: FaLinkedin, href: "https://linkedin.com/company/dialwiseai" },
        { icon: FaGithub, href: "https://github.com/dialwiseai" },
        { icon: FaTwitter, href: "https://x.com/dialwiseai" },
      ].map((social, index) => (
        <span key={index}>
          <Link href={social.href} target="_blank" rel="noopener noreferrer">
            <social.icon
              size={24}
              className="text-white transition-all duration-200 mx-2 ease-in-out hover:text-background hover:scale-125"
            />
          </Link>
        </span>
      ))}
    </div>
  );
}


export function SiteFooter() {
  return (
    <footer className="border-t bg-gray-900 py-6 mt-4">
      <div className="container mx-auto px-4 flex flex-col items-center gap-4 text-white">
        <p className="text-sm">
          <Link
            href="https://dialwise.ai/"
            target="_blank"
            rel="noopener noreferrer"
          >
            A glimpse of what&apos;s possible, powered by DialWise AI.
          </Link>
        </p>
        <SocialLinks />
      </div>
    </footer>
  );
}
