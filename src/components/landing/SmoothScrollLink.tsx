import type { MouseEvent, ReactNode } from "react";
import { smoothScrollToSection } from "@/utils/smoothScroll";

interface SmoothScrollLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
  offset?: number;
}

function SmoothScrollLink({
  href,
  className,
  children,
  offset,
}: SmoothScrollLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!href.startsWith("#") || href.length < 2) return;

    event.preventDefault();
    smoothScrollToSection(href.slice(1), { offset });
  };

  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}

export default SmoothScrollLink;
