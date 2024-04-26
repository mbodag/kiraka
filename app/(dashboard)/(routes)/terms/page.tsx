"use client";

import React from 'react';
import styles from './TermsPage.module.css';
import { Button } from '@/components/ui/button';


const TermsAndConditions: React.FC = () => {

    const handleClose = () => {
        try {
            window.close();
            setTimeout(() => {
                alert("This window cannot be closed automatically. Please close this window manually.");
            }, 100);
        } catch (e) {
            alert("Failed to close the window. Please close this window manually.");
        }
    };

    return (
        <div className={`${styles.termsBg} flex flex-col items-center pt-10 pb-8 min-h-screen analytics-font`}>
            <div style={{ margin: '0 15vw', marginBottom: '10vh' }}>
                <h1 className="text-xl" style={{ fontWeight: 'bold' }}>Terms of Service</h1>
                <p>
                    <strong>Privacy Policy:</strong>
                </p>
                <p>
                    We are committed to protecting the privacy and personal data of our users in compliance with the General Data Protection Regulation (GDPR) and other applicable data protection laws in the UK and Europe. This Privacy Policy outlines how we collect, use, and safeguard information when you use our service.
                </p>
                <ol>
                    <li>
                        <strong>Information Collection:</strong>
                        <br />
                        When you use our service, we may collect and process personal data that you voluntarily provide to us. This may include information such as your name, email address, and any text content you upload or submit. We do not collect any sensitive personal data unless required for specific purposes and with your explicit consent.
                    </li>
                    <li>
                        <strong>User-Generated Content:</strong>
                        <br />
                        Our service may allow users to upload or submit text content. We do not claim ownership of any text content uploaded or submitted by users. Users are solely responsible for ensuring that any text content they upload or submit complies with applicable laws and regulations, including copyright and intellectual property rights.
                    </li>
                    <li>
                        <strong>Copyrighted Texts:</strong>
                        <br />
                        We do not encourage or condone the uploading or submission of copyrighted texts without proper authorization from the copyright holder. Users are prohibited from uploading, submitting, or distributing copyrighted texts through our service without obtaining the necessary permissions or licenses.
                    </li>
                    <li>
                        <strong>Compliance with Data Protection Laws:</strong>
                        <br />
                        We comply with all applicable data protection laws, including the GDPR. We are committed to protecting the privacy and security of personal data and have implemented appropriate technical and organizational measures to ensure compliance with data protection principles.
                    </li>
                    <li>
                        <strong>Camera Usage:</strong>
                        <br />
                        Our service may utilize your device&apos;s camera for specific features or functionalities. We do not record, store, or transmit any images or video footage captured by your camera without your explicit consent. Any use of your camera is solely for the purpose of providing the intended functionality of our service, and we do not access or use your camera for any other purposes.
                    </li>
                    <li>
                        <strong>Data Security:</strong>
                        <br />
                        We take reasonable measures to protect the security of personal data transmitted through our service. However, no method of transmission over the internet or electronic storage is 100% secure. Therefore, while we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.
                    </li>
                    <li>
                        <strong>Changes to Privacy Policy:</strong>
                        <br />
                        We reserve the right to update or modify this Privacy Policy at any time. Any changes or modifications will be effective immediately upon posting the updated Privacy Policy on our website. You are encouraged to review this Privacy Policy periodically for any changes.
                    </li>
                </ol>
                <p>
                    By using our service, you signify your acceptance of this Privacy Policy. If you have any questions or concerns about this Privacy Policy or our practices regarding personal data, please contact us.
                </p>
                <div className="monospace-jetbrains-mono pt-14">
                    <Button onClick={handleClose} className="rounded-xl navbar-dashboard-font bg-blue-500 hover:bg-blue-600 text-white">
                        Close Window
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TermsAndConditions;