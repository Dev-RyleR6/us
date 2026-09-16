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
      const el = document.getElementById(targetId);
      if (el) {
        const headerOffset = 64;
        const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
        if ((window as unknown as { lenis?: { scrollTo: (t: number, opts: { duration: number }) => void } }).lenis) {
          (window as unknown as { lenis: { scrollTo: (t: number, opts: { duration: number }) => void } }).lenis.scrollTo(top, { duration: 1.8 });
        } else {
          window.scrollTo({ top, behavior: 'smooth' });
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
