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
                <br></br><br></br>
                <p>
                    <strong>Privacy Policy:</strong>
                </p>
                <p>
                We are committed to protecting the privacy and personal data of our users in compliance with the General Data Protection Regulation (GDPR) and other applicable data protection laws in the UK and Europe. This Privacy Policy outlines how we collect, use, and safeguard information when you use our service:
                </p>
                <br></br>
                <ol>
                    <li>
                        <strong>1. Information Collection:</strong>
                        <br />
                        When you use our service, we may collect and process personal data that you voluntarily provide to us. This may include information such as your name, email address, and any text content you upload or submit. We do not collect any sensitive personal data unless required for specific purposes and with your explicit consent.
                    </li>
                    <br></br>
                    <li>
                        <strong>2. User-Generated Content:</strong>
                        <br />
                        Our service may allow users to upload or submit text content. We do not claim ownership of any text content uploaded or submitted by users. Users are solely responsible for ensuring that any text content they upload or submit complies with applicable laws and regulations, including copyright and intellectual property rights.
                    </li>
                    <br></br>
                    <li>
                        <strong>3. Copyrighted Texts:</strong>
                        <br />
                        We do not encourage or condone the uploading or submission of copyrighted texts without proper authorisation from the copyright holder. Users are prohibited from uploading, submitting, or distributing copyrighted texts through our service without obtaining the necessary permissions or licences.
                    </li>
                    <br></br>
                    <li>
                        <strong>4. Compliance with Data Protection Laws:</strong>
                        <br />
                        We comply with all applicable data protection laws, including the GDPR. We are committed to protecting the privacy and security of personal data and have implemented appropriate technical and organisational measures to ensure compliance with data protection principles.
                    </li>
                    <br></br>
                    <li>
                        <strong>5. Camera Usage:</strong>
                        <br />
                        Our service may utilise your device&apos;s camera to collect gaze data for specific features or functionalities, through the use of the third-party tool <a href='https://webgazer.cs.brown.edu' target='_blank' rel='noopener noreferrer'><span style={{ fontStyle: 'italic', color: '', fontWeight: '' }}>WebGazer</span></a>, developed and maintained by researchers at Brown University. This technology tracks gaze positions at regular intervals, which we use for calibration and to enhance your speed reading experience. We strictly limit camera use to these functionalities alone and do not record, store, or transmit any images or video footage.
                    </li>
                    <br></br>
                    <li>
                        <strong>6. Data Security:</strong>
                        <br />
                        We take reasonable measures to protect the security of personal data transmitted through our service. However, no method of transmission over the Internet or electronic storage is 100% secure. Therefore, while we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.
                    </li>
                </ol>
                <br></br><br></br>
                <p><strong>Changes to Privacy Policy:</strong>
                    <br />
                    We reserve the right to update or modify this Privacy Policy at any time. Any changes or modifications will be effective immediately upon posting the updated Privacy Policy on our website. You are encouraged to review this Privacy Policy periodically for any changes.
                </p>
                <br></br>
                <p>
                    By using our service, you signify your acceptance of this Privacy Policy. If you have any questions or concerns about this Privacy Policy or our practices regarding personal data, please contact us at srp.doc.ic.ac.uk@gmail.com
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