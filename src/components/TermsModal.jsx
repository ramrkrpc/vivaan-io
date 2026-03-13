import { XMarkIcon } from '@heroicons/react/24/outline'

export default function TermsModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-[600px] max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Terms &amp; Conditions</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="flex-1 overflow-auto px-6 py-4 text-sm text-gray-700 space-y-4">
          <h3 className="font-bold text-base">Terms of Use</h3>
          <p>This Terms of Use ("<strong>Terms</strong>") is effective from January 1, 2025. These Terms supersede and replace any prior terms of use or agreements, whether oral or written, notified by Simply Vyapar Apps Private Limited ("<strong>Vyapar</strong>").</p>
          <p>Vyapar offers its integrated WhatsApp-based login system accessible at vyaparapp.in, as well as through its desktop application and mobile application (Android and iOS) ("<strong>Platforms</strong>"), to enable Users to access a suite of business communication features, including but not limited to SmartConnect, WhatsApp Marketing, invoice sharing, AI-powered responses, and product insights.</p>

          <h4 className="font-bold">1. DEFINITIONS</h4>
          <p>The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or plural.</p>
          <p>a) "<strong>Gen AI generated content</strong>" means any messages, notifications, responses, templates, or other communications (including text, images, or other media) generated in whole or in part by generative artificial intelligence tools or systems integrated into or made available through the Services.</p>
          <p>b) "<strong>Service</strong>" means the integrated WhatsApp-based login system offered by Vyapar on its Platforms which enables Users to access a suite of business communication features.</p>
          <p>c) "<strong>Platforms</strong>" means Vyapar's website accessible at vyaparapp.in, its desktop application and mobile application (Android and iOS) or any other mode or medium made available by Vyapar.</p>
          <p>d) "<strong>Terms</strong>" means all provisions applicable to the use of Vyapar's Services as described in these Terms of Use.</p>
          <p>e) "<strong>User</strong>" or "<strong>you</strong>" means the end user/customer accessing the Platform.</p>
          <p>f) "<strong>User's Content</strong>" or "<strong>Content</strong>" means any text, data, numbers, images, logos, trademarks, or other material provided, uploaded, or inserted by the User.</p>
          <p>g) "<strong>Vyapar</strong>" or "<strong>we</strong>" or "<strong>us</strong>" means Simply Vyapar Apps Private Limited.</p>

          <h4 className="font-bold">2. APPLICABILITY OF TERMS</h4>
          <p>a) These Terms set out the rights and obligations of all Users regarding the use of the Service. By accessing or using the Services from your personal and/or from your organisational email address, whether automated or otherwise, you agree to be bound by these Terms.</p>
          <p>b) By availing our Services, the User also accepts and agrees to be bound by Vyapar's policies as amended from time to time.</p>
          <p>c) We reserve the right to modify, alter or update these Terms at any time at our sole discretion by posting any such modified, altered or updated version of these Terms on our Platforms.</p>
          <p>d) All such modifications, alterations and updates will become effective immediately upon posting.</p>
          <p>e) We reserve the right to modify, suspend, or discontinue our Services at any time and from time to time, temporarily or permanently, in whole or in part, with or without notice.</p>

          <h4 className="font-bold">3. ACCEPTANCE OF TERMS OF USE</h4>
          <p>In consideration of your use of Vyapar's Services, you agree to the following:</p>
          <p>a) To provide true, accurate, current, and complete information as may be requested during the WhatsApp authentication or onboarding process.</p>
          <p>b) Promptly update your registration data and any other details shared with Vyapar to ensure it remains accurate and current.</p>
          <p>c) Ensure that the mobile number and associated WhatsApp account used for login remain under your control.</p>
        </div>
        <div className="flex justify-end px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
