'use client';

import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-sm text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                Welcome to Tabi ("we," "our," or "us"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our queue management service available at tabi.mn and related mobile applications (collectively, the "Service").
              </p>
              <p className="text-gray-700 mb-4">
                We are committed to protecting your privacy and ensuring transparency about our data practices. By using our Service, you agree to the collection and use of information in accordance with this Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-3">2.1 Information You Provide</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li><strong>Account Information:</strong> Name, email address, phone number, business name</li>
                <li><strong>Profile Information:</strong> Business details, operating hours, service descriptions</li>
                <li><strong>Communication Data:</strong> Messages, support requests, feedback</li>
                <li><strong>Payment Information:</strong> Billing details (processed securely by third-party providers)</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-3">2.2 Information Collected Automatically</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li><strong>Usage Data:</strong> How you interact with our Service, features used, time spent</li>
                <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                <li><strong>Location Data:</strong> General location information (with your consent)</li>
                <li><strong>Cookies and Tracking:</strong> Session data, preferences, analytics information</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-3">2.3 Third-Party Integrations</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li><strong>Google Calendar:</strong> Calendar access for appointment scheduling (with explicit consent)</li>
                <li><strong>Google Meet:</strong> Meeting creation for online appointments</li>
                <li><strong>Email Services:</strong> For sending notifications and confirmations</li>
                <li><strong>SMS Services:</strong> For queue updates and notifications (with consent)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">We use the collected information for the following purposes:</p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li><strong>Service Provision:</strong> To provide, maintain, and improve our queue management services</li>
                <li><strong>Account Management:</strong> To create and manage your account, authenticate users</li>
                <li><strong>Communication:</strong> To send service-related notifications, updates, and support responses</li>
                <li><strong>Appointment Management:</strong> To schedule, confirm, and manage appointments</li>
                <li><strong>Analytics:</strong> To understand usage patterns and improve our Service</li>
                <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
                <li><strong>Security:</strong> To protect against fraud, abuse, and security threats</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Google API Services</h2>
              <p className="text-gray-700 mb-4">
                Our Service integrates with Google API Services, including Google Calendar and Google Meet. When you connect your Google account:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>We access your Google Calendar only to create and manage appointments you schedule through our Service</li>
                <li>We create Google Meet links for online appointments with your explicit consent</li>
                <li>We do not access, store, or use your Google data for any purpose other than providing our queue management services</li>
                <li>You can revoke access to your Google account at any time through your Google Account settings</li>
                <li>Our use of Google APIs complies with Google's API Services User Data Policy</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Information Sharing and Disclosure</h2>
              <p className="text-gray-700 mb-4">We do not sell, trade, or rent your personal information. We may share information in the following circumstances:</p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li><strong>Service Providers:</strong> With trusted third-party service providers who assist in operating our Service</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>Consent:</strong> With your explicit consent for specific purposes</li>
                <li><strong>Safety:</strong> To protect the rights, property, or safety of our users or others</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement appropriate technical and organizational security measures to protect your information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Secure data storage and backup procedures</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Your Rights and Choices</h2>
              <p className="text-gray-700 mb-4">You have the following rights regarding your personal information:</p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Consent Withdrawal:</strong> Withdraw consent for specific data processing activities</li>
              </ul>
              <p className="text-gray-700 mb-4">
                To exercise these rights, please contact us at privacy@tabi.mn
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Data Retention</h2>
              <p className="text-gray-700 mb-4">
                We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your information, we will securely delete or anonymize it.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
              <p className="text-gray-700 mb-4">
                Your information may be transferred to and processed in countries other than your country of residence. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Children's Privacy</h2>
              <p className="text-gray-700 mb-4">
                Our Service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Your continued use of the Service after such changes constitutes acceptance of the updated Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>Email:</strong> privacy@tabi.mn</p>
                <p className="text-gray-700 mb-2"><strong>Website:</strong> https://tabi.mn</p>
                <p className="text-gray-700"><strong>Address:</strong> Ulaanbaatar, Mongolia, Khanuul District 26th building 5th floor 12</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
