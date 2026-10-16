import { Fragment } from "react";
import { Link } from "wouter";

export interface Crumb {
  label: string;
  href?: string;
}

/** Miga de pan: «Roadmaps › Java desde cero › Bucles». La última es donde estás. */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <span className="text-muted-foreground">
      {items.map((item, index) => {
        const last = index === items.length - 1;
        return (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 && " › "}
            {item.href && !last ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span className={last ? "text-foreground" : undefined}>{item.label}</span>
            )}
          </Fragment>
        );
      })}
    </span>
  );
}
