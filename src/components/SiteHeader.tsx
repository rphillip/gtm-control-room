const links = [
  ['Approach', '#control-room'],
  ['Case studies', '#work'],
  ['Technical proof', '#registry'],
  ['Experience', '#about'],
  ['Contact', '#contact'],
] as const

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="site-header__mark" href="#main" aria-label="RS — Ryan Sulapas, return to main content">
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
