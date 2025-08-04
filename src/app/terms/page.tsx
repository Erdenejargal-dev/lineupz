'use client';

import React from 'react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-sm text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                Welcome to Tabi ("we," "our," or "us"). These Terms of Service ("Terms") govern your use of our queue management service available at tabi.mn and related mobile applications (collectively, the "Service").
              </p>
              <p className="text-gray-700 mb-4">
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these Terms, then you may not access the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 mb-4">
                Tabi provides a digital queue management platform that allows businesses to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Create and manage digital queues and appointment systems</li>
                <li>Allow customers to join queues remotely</li>
                <li>Schedule appointments with calendar integration</li>
                <li>Send notifications via email and SMS</li>
                <li>Generate analytics and reports</li>
                <li>Integrate with third-party services like Google Calendar and Google Meet</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-3">3.1 Account Creation</h3>
              <p className="text-gray-700 mb-4">
                To use certain features of our Service, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-3">3.2 Account Security</h3>
              <p className="text-gray-700 mb-4">
                You are responsible for safeguarding your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-3">3.3 Account Types</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li><strong>Business Accounts:</strong> For service providers who create and manage queues</li>
                <li><strong>Customer Accounts:</strong> For end-users who join queues and book appointments</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Acceptable Use</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-3">4.1 Permitted Use</h3>
              <p className="text-gray-700 mb-4">
                You may use our Service only for lawful purposes and in accordance with these Terms. You agree to use the Service in a manner consistent with any applicable laws or regulations.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-3">4.2 Prohibited Activities</h3>
              <p className="text-gray-700 mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Use the Service for any unlawful purpose or to solicit unlawful activity</li>
                <li>Violate any international, federal, provincial, or local laws or regulations</li>
                <li>Transmit or procure the sending of any advertising or promotional material without our prior written consent</li>
                <li>Impersonate or attempt to impersonate the Company, a Company employee, another user, or any other person or entity</li>
                <li>Use the Service in any manner that could disable, overburden, damage, or impair the Service</li>
                <li>Use any robot, spider, or other automatic device to access the Service</li>
                <li>Attempt to gain unauthorized access to any portion of the Service</li>
                <li>Interfere with or circumvent the security features of the Service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Third-Party Integrations</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-3">5.1 Google Services</h3>
              <p className="text-gray-700 mb-4">
                Our Service integrates with Google services including Google Calendar and Google Meet. By using these integrations:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>You agree to Google's Terms of Service and Privacy Policy</li>
                <li>You grant us permission to access your Google Calendar for appointment management</li>
                <li>You understand that Google Meet links will be created for online appointments</li>
                <li>You can revoke access at any time through your Google Account settings</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-3">5.2 Other Third-Party Services</h3>
              <p className="text-gray-700 mb-4">
                We may integrate with other third-party services for email, SMS, payments, and analytics. Your use of these services is subject to their respective terms and conditions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Payment Terms</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-3">6.1 Subscription Plans</h3>
              <p className="text-gray-700 mb-4">
                We offer various subscription plans with different features and usage limits. Pricing and plan details are available on our website.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-3">6.2 Payment Processing</h3>
              <p className="text-gray-700 mb-4">
                Payments are processed by third-party payment processors. You agree to pay all charges incurred by you or any users of your account at the prices in effect when such charges are incurred.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-3">6.3 Refunds</h3>
              <p className="text-gray-700 mb-4">
                Refund policies vary by subscription plan and are detailed in your subscription agreement. Generally, we do not provide refunds for partial months of service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Intellectual Property Rights</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-3">7.1 Our Rights</h3>
              <p className="text-gray-700 mb-4">
                The Service and its original content, features, and functionality are and will remain the exclusive property of Tabi and its licensors. The Service is protected by copyright, trademark, and other laws.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-3">7.2 Your Content</h3>
              <p className="text-gray-700 mb-4">
                You retain ownership of any content you submit to the Service. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your content in connection with the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Privacy and Data Protection</h2>
              <p className="text-gray-700 mb-4">
                Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our Service. By using our Service, you agree to the collection and use of information in accordance with our Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Service Availability</h2>
              <p className="text-gray-700 mb-4">
                We strive to maintain high service availability, but we do not guarantee that the Service will be available at all times. The Service may be subject to limitations, delays, and other problems inherent in the use of the internet and electronic communications.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Disclaimers</h2>
              <p className="text-gray-700 mb-4">
                THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. WE EXPRESSLY DISCLAIM ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                IN NO EVENT SHALL TABI, ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE SERVICE.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Indemnification</h2>
              <p className="text-gray-700 mb-4">
                You agree to defend, indemnify, and hold harmless Tabi and its licensee and licensors, and their employees, contractors, agents, officers and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Termination</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-3">13.1 Termination by You</h3>
              <p className="text-gray-700 mb-4">
                You may terminate your account at any time by contacting us or through your account settings. Upon termination, your right to use the Service will cease immediately.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-3">13.2 Termination by Us</h3>
              <p className="text-gray-700 mb-4">
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including but not limited to a breach of the Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">14. Governing Law</h2>
              <p className="text-gray-700 mb-4">
                These Terms shall be interpreted and governed by the laws of [Your Jurisdiction], without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">15. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">16. Severability</h2>
              <p className="text-gray-700 mb-4">
                If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law and the remaining provisions will continue in full force and effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">17. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>Email:</strong> legal@tabi.mn</p>
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
