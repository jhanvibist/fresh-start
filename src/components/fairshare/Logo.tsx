import logo from "@/assets/fairshare-logo.png";

export const Logo = ({ className = "h-9" }: { className?: string }) => (
  <img src={logo} alt="FairShare logo" className={`${className} w-auto`} />
);
