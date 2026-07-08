import Image from "next/image";
import Link from "next/link";

type LogoMarkProps = {
  className?: string;
  size?: number;
  href?: string;
  priority?: boolean;
};

export function LogoMark({ className = "", size = 36, href, priority = false }: LogoMarkProps) {
  const image = (
    <Image
      alt="Ogrodio"
      className={`rounded-lg object-contain ${className}`}
      height={size}
      priority={priority}
      src="/brand/ogrodio-leaf.jpg"
      width={size}
    />
  );

  if (href) {
    return (
      <Link className="inline-flex shrink-0 items-center" href={href}>
        {image}
      </Link>
    );
  }

  return image;
}
