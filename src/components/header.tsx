import { Link } from 'gatsby'
import * as PropTypes from 'prop-types'
import * as React from 'react'

const Header: React.SFC<{ siteTitle?: string }> = ({ siteTitle }) => (
  <header>
    <Link to={'/'}>{siteTitle}</Link>
  </header>
)

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
}

export default Header
