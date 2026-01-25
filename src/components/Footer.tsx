import Link from "next/link";
import Image from "next/image";
import { Github } from "lucide-react";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border/40 bg-background/95 pb-8 pt-14 backdrop-blur-sm">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-8 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-32">
          {/* Left Column: Brand & Tagline */}
          <div className="space-y-4">
            <Link
              href="/"
              className="flex w-fit items-center gap-3 transition-opacity hover:opacity-80"
            >
              <Image
                src="/icons/logo.svg"
                alt="Logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-xl font-bold tracking-tight">
                Stream Track
              </span>
            </Link>
            <p className="max-w-sm text-sm font-medium leading-relaxed text-muted-foreground">
              Track What You Watch. Love What You Watch. Never Forget a Single
              Show. (っ◔◡◔)っ
            </p>
          </div>

          {/* Right Column: Disclaimer */}
          <div className="space-y-4 md:text-right">
            <h3 className="font-semibold tracking-tight text-foreground">
              Disclaimer ¯\_(ツ)_/¯
            </h3>
            <p className="ml-auto max-w-xl text-sm leading-relaxed text-muted-foreground">
              Please note: Stream Track does not host any files itself but
              instead only displays content from third party providers. Legal
              issues should be taken up with them.
            </p>
          </div>
        </div>

        {/* Bottom Bar: Socials & Links */}
        <div className="flex flex-col items-center justify-between gap-6 border-t border-border/40 pt-8 md:flex-row">
          {/* Left: GitHub */}
          <div className="flex items-center">
            <a
              href="https://github.com/nitai-satapathy/Stream-Track"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Github className="h-5 w-5 transition-colors group-hover:text-foreground" />
              <span>GitHub</span>
            </a>
          </div>

          {/* Center: Crafted With */}
          <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <span>Crafted with</span>
            <span className="inline-flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M7.5 3.33301V4.99967H9.16667V6.66634H10.8333V4.99967H12.5V3.33301H15.8333V4.99967H17.5V9.99967H15.8333V11.6663H14.1667V13.333H12.5V14.9997H10.8333V16.6663H9.16667V14.9997H7.5V13.333H5.83333V11.6663H4.16667V9.99967H2.5V4.99967H4.16667V3.33301H7.5Z"
                  fill="#F43F5E"
                ></path>
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M7.50004 1.66699H4.16671V3.33366H2.50004V5.00033H0.833374V10.0003H2.50004V11.667H4.16671V13.3337H5.83337V15.0003H7.50004V16.667H9.16671V18.3337H10.8334V16.667H12.5V15.0003H14.1667V13.3337H15.8334V11.667H17.5V10.0003H19.1667V5.00033H17.5V3.33366H15.8334V1.66699H12.5V3.33366H10.8334V5.00033H9.16671V3.33366H7.50004V1.66699ZM7.50004 3.33366V5.00033H9.16671V6.66699H10.8334V5.00033H12.5V3.33366H15.8334V5.00033H17.5V10.0003H15.8334V11.667H14.1667V13.3337H12.5V15.0003H10.8334V16.667H9.16671V15.0003H7.50004V13.3337H5.83337V11.667H4.16671V10.0003H2.50004V5.00033H4.16671V3.33366H7.50004Z"
                  fill="#020617"
                ></path>
                <rect
                  x="14.1666"
                  y="5"
                  width="1.66667"
                  height="1.66667"
                  fill="white"
                ></rect>
                <rect
                  x="14.1666"
                  y="6.66699"
                  width="1.66667"
                  height="1.66667"
                  fill="white"
                ></rect>
                <rect
                  x="12.5"
                  y="5"
                  width="1.66667"
                  height="1.66667"
                  fill="white"
                ></rect>
              </svg>
            </span>
            <span>
              by{" "}
              <Link
                href="https://nitaisatapathy.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium transition-colors hover:text-foreground"
              >
                Nitai
              </Link>
            </span>
          </div>

          {/* Right: Legal & Copyright */}
          <div className="flex w-full items-center justify-between gap-6 text-sm text-muted-foreground md:w-auto md:justify-end">
            <Link
              href="/about"
              className="font-medium transition-colors hover:text-foreground"
            >
              About
            </Link>
            <Link
              href="/legal"
              className="font-medium transition-colors hover:text-foreground"
            >
              Legal / DMCA
            </Link>
            <span>
              &copy; {year}{" "}
              <Link
                href="/"
                className="font-medium transition-colors hover:text-foreground"
              >
                Stream Track
              </Link>
              .
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
