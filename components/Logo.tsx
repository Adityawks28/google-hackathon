import Image from "next/image";

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 32, className }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Uriboarkun logo"
      width={size}
      height={size}
      className={className}
    />
  );
}
