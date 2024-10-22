"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentProps, ReactNode } from "react";

export function Nav({ children }: { children: ReactNode }) {
  return (
    <nav className="bg-slate-500 texxt-primary-foreground flex justify-center px-4">
      {children}
    </nav>
  );
}

export function NavLink(props: Omit<ComponentProps<typeof Link>, "className">) {
  const pathname = usePathname();
  return (
    // Render the `Link` component from Next.js.
    // Spread all the incoming props (`...props`) except for `className`,
    // since we handle `className` internally.
    <Link
      {...props}
      className={cn(
        "p-4 text-white font-bold hover:bg-secondary hover:text-secondary-foreground focus-visible:bg-secondary focus-visible:text-secondary-foreground",
        // If the current page's pathname matches the link's href (meaning this link points
        // to the current page), add extra styles to indicate it's active.
        pathname === props.href && "bg-background text-foreground"
      )}
    />
  );
}
