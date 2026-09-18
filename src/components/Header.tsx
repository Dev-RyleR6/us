import React from 'react';

interface HeaderProps {
  onNavigate?: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(targetId);
    } else {
      const lenis = (window as unknown as { lenis?: { scrollTo: (target: HTMLElement | number, opts: { duration?: number; offset?: number }) => void } }).lenis;
      if (targetId === 'hero') {
        if (lenis) {
          lenis.scrollTo(0, { duration: 1.5 });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      }
      const el = document.getElementById(targetId);
      if (el) {
        const header = document.getElementById('site-header');
        const headerOffset = header ? header.getBoundingClientRect().height : 56;
        if (lenis) {
          lenis.scrollTo(el, { offset: -headerOffset, duration: 1.5 });
        } else {
          const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
          window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <header id="site-header" role="banner">
      <div className="header__inner">
        <a
          href="#hero"
          className="header__logo"
          aria-label="Just Us — Return to top"
          onClick={(e) => handleNavClick(e, 'hero')}
        >
          <span>Just</span> Us
        </a>

        <nav role="navigation" aria-label="Primary navigation">
          <ul className="header__nav">
            <li>
              <a
                href="#featured"
                id="nav-featured"
                onClick={(e) => handleNavClick(e, 'featured')}
              >
                Featured
              </a>
            </li>
            <li>
              <a
                href="#archive"
                id="nav-archive"
                onClick={(e) => handleNavClick(e, 'archive')}
              >
                Archive
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

