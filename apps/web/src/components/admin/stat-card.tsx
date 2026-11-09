import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  label: string;
  value: number;
  icon: ReactNode;
  // Makes the whole card a link
  href?: string;
};

const StatCard = ({ label, value, icon, href }: Props) =>{
  const content = (
    <>
      <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</span>
      <dd className="mt-4 text-3xl font-bold tabular-nums">{value}</dd>
      <dt className="mt-1 text-sm text-muted-foreground">{label}</dt>
    </>
  );
  const className = "block rounded-2xl border bg-white p-5 shadow-sm";

  return (
    <div>
      {href ? (
        <Link href={href} className={`${className} transition hover:-translate-y-0.5 hover:shadow-md`}>
          {content}
        </Link>
      ) : (
        <div className={className}>{content}</div>
      )}
    </div>
  );
}

export default StatCard