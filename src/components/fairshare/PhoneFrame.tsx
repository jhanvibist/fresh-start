import { ReactNode } from "react";

export const PhoneFrame = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`relative mx-auto w-[260px] h-[540px] rounded-[2.6rem] bg-foreground p-2 shadow-float ${className}`}
  >
    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-foreground rounded-b-2xl z-20" />
    <div className="relative h-full w-full rounded-[2.1rem] overflow-hidden bg-background">
      {children}
    </div>
  </div>
);
