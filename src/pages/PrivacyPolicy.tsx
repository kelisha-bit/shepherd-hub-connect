import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Privacy Policy</CardTitle>
            <p className="text-center text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none dark:prose-invert">
            <h2>Information We Collect</h2>
            <p>
              We collect information you provide directly to us, such as when you create an account, 
              update your profile, make donations, or contact us for support.
            </p>

            <h2>How We Use Your Information</h2>
            <ul>
              <li>To provide and maintain our church management services</li>
              <li>To process donations and maintain financial records</li>
              <li>To communicate with you about church events and activities</li>
              <li>To improve our services and user experience</li>
            </ul>

            <h2>Information Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. 
              We may share your information only in specific circumstances such as legal compliance.
            </p>

            <h2>Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h2>Your Rights</h2>
            <p>
              You have the right to access, update, or delete your personal information. 
              Contact us if you wish to exercise these rights.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at your church's 
              designated contact information.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}