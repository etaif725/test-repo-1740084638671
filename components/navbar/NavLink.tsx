'use client';

import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { CSSProperties, PropsWithChildren, useMemo } from 'react';

export type NavLinkProps = NextLinkProps &
  PropsWithChildren & {
    styles?: CSSProperties;
    borderRadius?: string;
    className?: string;
    href: string;
  };

function NavLink({ href, className, children, styles, borderRadius, ...props }: NavLinkProps) {
  const memoizedStyles = useMemo(
    () => ({
      borderRadius: borderRadius || 0,
      ...styles
    }),
    [borderRadius, styles]
  );

  return (
    <NextLink href={href} className={`${className}`} style={memoizedStyles} {...props}>
      {children}
    </NextLink>
  );
}

export default NavLink;
