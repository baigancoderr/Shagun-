import Header from '../Directives/Header'
import Footer from '../Directives/Footer'

export default function PrivacyPolicy() {
  return (
    <>
    <div className="bg-gradient-to-b from-[#000] via-[#000] to-[#000] min-h-screen text-white">
    <Header />
     <section  className="w-full py-20 px-4 font-['Poppins']">
      <div className="max-w-4xl mx-auto">

        {/* Title */}
        <h1 className="text-center text-[24px] md:text-[36px] sm:text-[28px] font-semibold text-white mb-12">
          Privacy Policy
        </h1>

        {/* Block */}
        <div className="space-y-10">

          <div>
            <h2 className="text-[22px] font-semibold text-[#f7f9ff] mb-3">
              Introduction
            </h2>
            <p className="text-[16px] leading-[1.6] text-[#aaaaaa]">
             Shagun Pro values your privacy and is committed to protecting your personal information collected through our platform and related services. This Privacy Policy explains what data we collect, how it is used, and your rights regarding that information.
            </p>
          </div>

          <div>
            <h2 className="text-[22px] font-semibold text-[#f7f9ff] mb-3">
              Information We Collect
            </h2>
            <p className="text-[16px] leading-[1.6] text-[#aaaaaa] mb-3">
           We may collect personal data when you register an account, place orders, subscribe to updates, or interact with the platform. This may include your name, email address, phone number, address, transaction details, and other relevant information required to provide and improve our services.
            </p>
            <p className="text-[16px] leading-[1.6] text-[#aaaaaa]">
             We may also collect usage data automatically, such as device information, IP address, and browsing activity through cookies and similar tracking technologies.
            </p>
          </div>

          <div>
            <h2 className="text-[22px] font-semibold text-[#f7f9ff] mb-3">
              Use of Information
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-[16px] leading-[1.6] text-[#aaaaaa]">
              <li> Provide and manage services, including account setup and order processing</li>
              <li>Respond to inquiries and provide customer support</li>
              <li>Send updates related to products, services, and platform improvements</li>
              <li>Comply with applicable legal and regulatory requirementse</li>
              <li>Improve and personalize user experience on the platform</li>
            </ul>
          </div>

          <div>
            <h2 className="text-[22px] font-semibold text-[#f7f9ff] mb-3">
              Data Sharing and Disclosure
            </h2>
            <p className="text-[16px] leading-[1.6] text-[#aaaaaa]">
          We may share your information with trusted service providers, delivery partners, or legal authorities when required to provide services or comply with applicable laws. Shagun Pro does not sell personal data to third parties for marketing purposes without user consent.
            </p>
          </div>

          <div>
            <h2 className="text-[22px] font-semibold text-[#f7f9ff] mb-3">
              Cookies and Tracking
            </h2>
            <p className="text-[16px] leading-[1.6] text-[#aaaaaa]">
             We use cookies and similar technologies to analyze platform usage, enhance performance, and improve user experience. Users may disable cookies through browser settings, though some features may be affected..
            </p>
          </div>

          <div>
            <h2 className="text-[22px] font-semibold text-[#f7f9ff] mb-3">
              Security
            </h2>
            <p className="text-[16px] leading-[1.6] text-[#aaaaaa]">
              We implement appropriate security measures to protect your personal data. However, no system is completely secure, and users acknowledge inherent risks associated with digital platforms.
            </p>
          </div>

          <div>
            <h2 className="text-[22px] font-semibold text-[#f7f9ff] mb-3">
              Your Rights
            </h2>
            <p className="text-[16px] leading-[1.6] text-[#aaaaaa]">
             Users may have the right to access, update, or request deletion of their personal data, subject to applicable legal requirements and operational policies.
            </p>
          </div>

          <div>
            <h2 className="text-[22px] font-semibold text-[#f7f9ff] mb-3">
              Updates to This Policy
            </h2>
            <p className="text-[16px] leading-[1.6] text-[#aaaaaa]">
              Shagun Pro may update this Privacy Policy from time to time. Any changes will be reflected on the platform, and continued use of the services constitutes acceptance of the updated policy.
            </p>
          </div>

        </div>
      </div>
    </section>

        <Footer /> 
        </div>
    </>
   
  );
}
