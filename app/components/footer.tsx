function ArrowIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.07102 11.3494L0.963068 10.2415L9.2017 1.98864H2.83807L2.85227 0.454545H11.8438V9.46023H10.2955L10.3097 3.09659L2.07102 11.3494Z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="footer-container">
      <ul className="footer-list">
        <li>
          <a
            href="/rss"
            className="footer-item"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ArrowIcon />
            <p className="paragraph-icon-label">rss</p>
          </a>
        </li>
        <li>
          <a
            href="https://github.com/renjith100"
            className="footer-item"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ArrowIcon />
            <p className="paragraph-icon-label">github</p>
          </a>
        </li>
        <li>
          <a
            href="https://github.com/renjith100/blog"
            className="footer-item"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ArrowIcon />
            <p className="paragraph-icon-label">view source</p>
          </a>
        </li>
      </ul>
      <p className="mt-8 paragraph-footer">
        {new Date().getFullYear()} MIT Licensed
      </p>
    </footer>
  )
}
