const links = [
  ['Control Room', '#control-room'],
  ['Work', '#work'],
  ['Registry', '#registry'],
  ['About', '#about'],
  ['Contact', '#contact'],
] as const

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="site-header__mark" href="#main" aria-label="Ryan Sulapas — return to main content">
        RS<span aria-hidden="true">/</span>
      </a>
      <nav aria-label="Portfolio sections">
        <ul className="site-header__nav">
          {links.map(([label, href]) => (
            <li key={href}>
              <a href={href}>{label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
