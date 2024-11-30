import React from "react";

const LogoText = () => {
  return (
    <div className="relative flex items-center justify-center h-8 w-24">
      {/* Background shapes */}
      <svg
        className="absolute"
        viewBox="0 0 96 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Circle shape */}
        <circle
          cx="16"
          cy="16"
          r="12"
          className="fill-primary/10 dark:fill-primary/20"
        />
        {/* Rectangle shape */}
        <rect
          x="32"
          y="4"
          width="24"
          height="24"
          rx="4"
          className="fill-primary/5 dark:fill-primary/15"
          transform="rotate(15 44 16)"
        />
        {/* Triangle shape */}
        <path
          d="M72 4L84 28L60 28L72 4Z"
          className="fill-primary/15 dark:fill-primary/25"
        />
      </svg>

      {/* Text */}
      <span className="relative font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50 dark:from-primary dark:to-primary/70">
        SBTE
      </span>
    </div>
  );
};

export default LogoText;
