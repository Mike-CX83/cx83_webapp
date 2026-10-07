import { Banner } from '@payloadcms/ui/elements/Banner'
import React from 'react'

import './index.scss'

const baseClass = 'before-dashboard'

const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>CX83 Labs</h4>
      </Banner>
      <p>
        You are signed in with full owner access for this development site. Create, edit, delete, and
        publish pages, services, projects, case studies, posts, media, forms, and settings directly.
      </p>
      <p>
        The Payload website template includes a demo seed. Do not run it. It would add template
        marketing content that is not CX83 content.
      </p>
    </div>
  )
}

export default BeforeDashboard
