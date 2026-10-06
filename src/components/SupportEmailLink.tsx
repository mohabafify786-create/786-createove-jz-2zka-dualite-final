import React, { useState, useEffect } from 'react';

export const SUPPORT_EMAIL = 'supportheartsyncone@gmail.com';
export const GMAIL_COMPOSE_URL = `https://mail.google.com/mail/?view=cm&fs=1&to=${SUPPORT_EMAIL}`;
export const MAILTO_URL = `mailto:${SUPPORT_EMAIL}`;

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  );
}

export interface SupportEmailLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children?: React.ReactNode;
}

export const SupportEmailLink: React.FC<SupportEmailLinkProps> = ({
  children = SUPPORT_EMAIL,
  className,
  ...props
}) => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  const href = isMobile ? MAILTO_URL : GMAIL_COMPOSE_URL;
  const target = isMobile ? undefined : '_blank';
  const rel = isMobile ? undefined : 'noopener noreferrer';

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={className}
      {...props}
    >
      {children}
    </a>
  );
};

export default SupportEmailLink;
