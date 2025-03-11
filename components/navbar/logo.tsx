import React from "react";
import { useTheme } from "next-themes";

const LogoText = () => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  return (
    <div className="relative flex items-center justify-center h-10 w-24 group">
      {/* Logo image - switches between light and dark versions */}
      <img
        src={"/sbte-logo-gov.png"}
        alt="SBTE Logo"
        className="absolute w-full h-full object-contain transition-opacity duration-300 dark:invert"
      />

      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-70 transition-all duration-300 -z-10"></div>

      {/* Text */}
      {/* <span className="relative font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50 dark:from-primary dark:to-primary/70 group-hover:from-primary group-hover:to-primary group-hover:dark:from-primary group-hover:dark:to-primary transition-all duration-300">
        SBTE
      </span> */}
    </div>
  );
};

export default LogoText;
