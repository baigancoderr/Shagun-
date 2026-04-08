
import Header from '../Directives/Header'
import Footer from '../Directives/Footer'

export default function TermsAndConditions() {
  return (
    <>
      <div className="bg-gradient-to-b from-[#000] via-[#000] to-[#000] min-h-screen text-white">
        <Header />
        <section  className="w-full py-20 px-4 font-['Poppins']">
          <div className="max-w-4xl mx-auto">

            {/* Title */}
            <h1 className="text-center text-[24px] md:text-[36px] sm:text-[28px] font-semibold text-white mb-12">
              Terms & Conditions
            </h1>

            {/* Content */}
            <div className="space-y-10">

              <div>
                <h2 className="text-[22px] font-semibold text-[#f7f9ff] mb-3">
                  Acceptance
                </h2>
                <p className="text-[16px] leading-[1.6] text-[#aaaaaa]">
                  By accessing <span className="font-medium">Shagunpro</span>  platform, products, and services, you agree to be bound by these Terms & Conditions and any future updates. If you do not agree with any part of these Terms, you must not use the platform or its services.
               </p>
              </div>

              <div>
                <h2 className="text-[22px] font-semibold text-[#f7f9ff] mb-3">
                  Eligibility
                </h2>
                <p className="text-[16px] leading-[1.6] text-[#aaaaaa]">
                 You must be at least 18 years old and have the legal capacity to enter into these Terms and use the services provided by Shagun Pro.
                </p>
              </div>

               {/* Tokenized Property Investment Terms */}
              <div >
                <h2 className="text-[22px] font-semibold text-[#f7f9ff] mb-4">
                  Product & Service Usage Terms – SHAGUN PRO
                </h2>

                <ul className="list-disc pl-5 space-y-3 text-[16px] leading-[1.6] text-[#aaaaaa]">
                  <li>
                    The User agrees to purchase and use products and services offered by Shagun Pro for personal or business purposes.
                  </li>
                  <li>
                    All products are provided based on availability and may vary in features or specifications.
Shagun Pro does not guarantee specific outcomes from product usage, as results may vary depending on individual use.
                  </li>
                  <li>
                    Users are responsible for reviewing product details and specifications before making a purchase.
                  </li>
                  <li>
                    Shagun Pro reserves the right to update, modify, or discontinue any product or service without prior notice.
                  </li>
                  <li>
                   Any misuse, resale without authorization, or misrepresentation of products is strictly prohibited.
Users agree to comply with all applicable laws while using Shagun Pro products and services.
All purchases and usage are subject to company policies, including delivery and support guidelines.
                  </li>
                  {/* <li>
                    Returns are credited as per property performance and platform policy.
                  </li>
                  <li>
                    The Investor has reviewed all project, return, and token details before investing.
                  </li>
                  <li>
                    The Investor agrees to complete KYC / AML verification.
                  </li>
                  <li>
                    This investment agreement is governed by the laws of Georgia.
                  </li> */}
                </ul>

                {/* <div className="mt-6 flex items-start gap-3">
                  <input type="checkbox" className="mt-1 w-5 h-5" />
                  <p className="text-[16px] text-[#323232] font-medium">
                    I have read, understood, and agree to the Tokenized Property Investment Agreement of URBANRWA.
                  </p>
                </div> */}
              </div>

             


              <div>
                <h2 className="text-[22px] font-semibold text-[#f7f9ff] mb-3">
                  Services
                </h2>
                <p className="text-[16px] leading-[1.6] text-[#aaaaaa]">
                  Shagun Pro provides a platform for showcasing and delivering innovative products and related services. We reserve the right to modify, restrict, suspend, or discontinue any part of the Services at any time without prior notice.
                </p>
              </div>

              <div>
                <h2 className="text-[22px] font-semibold text-[#f7f9ff] mb-3">
                  Accounts
                </h2>
                <p className="text-[16px] leading-[1.6] text-[#aaaaaa]">
             Certain features may require account registration. You agree to provide accurate and up-to-date information and to maintain the confidentiality of your login credentials. You are responsible for all activities conducted under your account.
                </p>
              </div>

              <div>
                <h2 className="text-[22px] font-semibold text-[#f7f9ff] mb-3">
                  User Conduct
                </h2>
                <p className="text-[16px] leading-[1.6] text-[#aaaaaa]">
                 You agree not to misuse the platform, engage in unlawful activity, interfere with operations, or violate intellectual property rights. Any such actions may result in suspension or termination of access.
                </p>
              </div>

              <div>
                <h2 className="text-[22px] font-semibold text-[#f7f9ff] mb-3">
                  Intellectual Property
                </h2>
                <p className="text-[16px] leading-[1.6] text-[#aaaaaa]">
                All content on the platform, including logos, designs, text, graphics, and product materials, is the property of Shagun Pro and is protected under applicable intellectual property laws
                </p>
              </div>

              <div>
                <h2 className="text-[22px] font-semibold text-[#f7f9ff] mb-3">
                  Limitation of Liability
                </h2>
                <p className="text-[16px] leading-[1.6] text-[#aaaaaa]">
                 To the maximum extent permitted by law, Shagun Pro shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use of its products, platform, or services
                </p>
              </div>

              <div>
                <h2 className="text-[22px] font-semibold text-[#f7f9ff] mb-3">
                  Governing Law
                </h2>
                <p className="text-[16px] leading-[1.6] text-[#aaaaaa]">
               These Terms & Conditions shall be governed by and interpreted in accordance with the applicable laws of India.
                </p>
              </div>

              <div>
                <h2 className="text-[22px] font-semibold text-[#f7f9ff] mb-3">
                  Changes to Terms
                </h2>
                <p className="text-[16px] leading-[1.6] text-[#aaaaaa]">
                Shagun Pro reserves the right to update or modify these Terms at any time. Continued use of the platform after any changes constitutes acceptance of the revised Terms.
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
