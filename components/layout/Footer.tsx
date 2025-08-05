import Link from 'next/link'
import { footerSections, socialLinks, footerConfig, newsletterData } from '@/data'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">{footerConfig.companyInfo.name}</h3>
            <p className="text-gray-300 mb-4">
              {footerConfig.companyInfo.description}
            </p>
            
            {/* Newsletter */}
            {footerConfig.showNewsletter && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-3">{newsletterData.title}</h4>
                <p className="text-gray-300 text-sm mb-4">{newsletterData.description}</p>
                <div className="flex max-w-md">
                  <input
                    type="email"
                    placeholder={newsletterData.placeholder}
                    className="flex-1 px-4 py-2 rounded-l-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-r-md transition-colors">
                    {newsletterData.buttonText}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-lg font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Links & Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              {footerConfig.copyrightText}
            </p>
            
            {footerConfig.showSocialLinks && (
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <Link
                    key={social.name}
                    href={social.href}
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label={social.name}
                  >
                    <span className="sr-only">{social.name}</span>
                    {/* Icon placeholder - you can replace with actual icons */}
                    <div className="w-5 h-5 rounded" style={{ backgroundColor: social.color }}></div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}