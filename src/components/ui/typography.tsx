import React from "react";

type Variant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "p"
  | "blockquote"
  | "lead"
  | "large"
  | "small"
  | "muted"
  | "inlineCode"
  | "list";

interface TypographyProps {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

export function Typography({
  children,
  variant = "p",
  className = "",
}: TypographyProps) {
  switch (variant) {
    case "h1":
      return (
        <h1
          className={`scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance ${className}`}
        >
          {children}
        </h1>
      );
    case "h2":
      return (
        <h2
          className={`scroll-m-20 pb-2 text-3xl font-semibold tracking-tight ${className}`}
        >
          {children}
        </h2>
      );
    case "h3":
      return (
        <h3
          className={`scroll-m-20 text-2xl font-semibold tracking-tight ${className}`}
        >
          {children}
        </h3>
      );
    case "h4":
      return (
        <h4
          className={`scroll-m-20 text-xl font-semibold tracking-tight ${className}`}
        >
          {children}
        </h4>
      );
    case "p":
      return <p className={`not-first:mt-2yp ${className}`}>{children}</p>;
    case "blockquote":
      return (
        <blockquote className={`mt-2 border-l-2 pl-2 italic ${className}`}>
          {children}
        </blockquote>
      );
    case "lead":
      return (
        <p className={`text-muted-foreground text-xl ${className}`}>
          {children}
        </p>
      );
    case "large":
      return <div className={`text-lg ${className}`}>{children}</div>;
    case "small":
      return (
        <small className={`text-sm leading-none ${className}`}>
          {children}
        </small>
      );
    case "muted":
      return (
        <p className={`text-muted-foreground text-sm ${className}`}>
          {children}
        </p>
      );
    case "inlineCode":
      return (
        <code
          className={`bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm ${className}`}
        >
          {children}
        </code>
      );
    case "list":
      return (
        <ul className={`my-6 ml-6 list-disc [&>li]:mt-2 ${className}`}>
          {children}
        </ul>
      );
    default:
      return <p className={className}>{children}</p>;
  }
}
