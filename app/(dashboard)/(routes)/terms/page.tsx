"use client";

import React from 'react';
import styles from './TermsPage.module.css';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation'


const TermsAndConditions: React.FC = () => {
    const router = useRouter();

    const goBack = () => {
        if (window.history.length > 1) {
          router.back();
        } else {
          // Programmatically navigate using Next.js router since window.history is not feasible
          router.push('/instructions');
        }
      };

    return (
        <div className={`${styles.termsBg} flex flex-col items-center pt-10 pb-8 min-h-screen analytics-font`}>
            <div style={{ margin: '0 15vw', marginBottom: '10vh' }}>
                <h1 className="text-xl" style={{ fontWeight: 'bold' }}>Terms of Service</h1>
                <p>
                    <br /><br />
                    We understand the importance of privacy and are committed to protecting the personal information of our users. This Privacy Policy outlines how we collect, use, and safeguard information when you use our service.
                </p>
                <br />
                <p>
                    <strong>Information Collection:</strong>
                    <br />
                    When you use our service, we do not collect or store any personal information unless voluntarily provided by you. We do not require users to create accounts or provide personal information to access our service.
                </p>
                <br />
                <p>
                    <strong>User-Generated Content:</strong>
                    <br />
                    Our service may allow users to upload or submit text content. We do not claim ownership of any text content uploaded or submitted by users. Users are solely responsible for ensuring that any text content they upload or submit does not infringe upon the rights of others, including copyright and intellectual property rights.
                </p>
                <br />
                <p>
                    <strong>Copyrighted Texts:</strong>
                    <br />
                    We do not encourage or condone the uploading or submission of copyrighted texts without proper authorization from the copyright holder. Users are prohibited from uploading, submitting, or distributing copyrighted texts through our service without obtaining the necessary permissions or licenses.
                </p>
                <br />
                <p>
                    <strong>Compliance with Copyright Law:</strong>
                    <br />
                    We comply with all applicable copyright laws and regulations, including the Digital Millennium Copyright Act (DMCA). We have implemented procedures for addressing claims of copyright infringement in accordance with the DMCA. If you believe that your copyrighted work has been infringed upon through our service, please contact us with a notice of infringement that includes the following information:
                    <br /><br />
                    - Identification of the copyrighted work claimed to have been infringed.
                    <br />
                    - Identification of the infringing material and its location within our service.
                    <br />
                    - Sufficient information to allow us to contact the complaining party.
                    <br />
                    - A statement that the complaining party has a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.
                    <br />
                    - A statement that the information in the notification is accurate, and under penalty of perjury, that the complaining party is authorized to act on behalf of the owner of the exclusive right that is allegedly infringed.
                    <br /><br />
                    Upon receipt of a valid DMCA notice, we will promptly remove or disable access to the infringing material and take appropriate action in accordance with applicable laws and regulations.
                </p>
                <br />
                <p>
                    <strong>Data Security:</strong>
                    <br />
                    We take reasonable measures to protect the security of information transmitted through our service. However, no method of transmission over the internet or electronic storage is 100% secure. Therefore, while we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
                </p>
                <br />
                <p>
                    <strong>Changes to Privacy Policy:</strong>
                    <br />
                    We reserve the right to update or modify this Privacy Policy at any time. Any changes or modifications will be effective immediately upon posting the updated Privacy Policy on our website. You are encouraged to review this Privacy Policy periodically for any changes.
                </p>
                <br />
                <p>
                    By using our service, you signify your acceptance of this Privacy Policy. If you have any questions or concerns about this Privacy Policy or our practices, please contact us.
                </p>
                <div className="monospace-jetbrains-mono pt-14">
                    <Button onClick={goBack} className="rounded-xl navbar-dashboard-font bg-blue-500 hover:bg-blue-600 text-white">
                        Go Back
                    </Button>
                </div>
            </div>
        </div>
    );
};


export default TermsAndConditions
