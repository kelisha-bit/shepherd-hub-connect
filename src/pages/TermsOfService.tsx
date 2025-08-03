import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Terms of Service</CardTitle>
            <p className="text-center text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none dark:prose-invert">
            <h2>Acceptance of Terms</h2>
            <p>
              By accessing and using this church management system, you accept and agree to be bound 
              by the terms and provision of this agreement.
            </p>

            <h2>Use License</h2>
            <p>
              Permission is granted to use this system for church management purposes. This license 
              shall automatically terminate if you violate any of these restrictions.
            </p>

            <h2>User Accounts</h2>
            <ul>
              <li>You are responsible for maintaining the confidentiality of your account</li>
              <li>You agree to provide accurate and complete information</li>
              <li>You are responsible for all activities under your account</li>
            </ul>

            <h2>Prohibited Uses</h2>
            <p>You may not use this service:</p>
            <ul>
              <li>For any unlawful purpose or to solicit unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations or laws</li>
              <li>To transmit or procure the sending of any advertising or promotional material</li>
              <li>To impersonate or attempt to impersonate the church or other users</li>
            </ul>

            <h2>Disclaimer</h2>
            <p>
              The information on this system is provided on an 'as is' basis. To the fullest extent 
              permitted by law, this organization excludes all representations, warranties, obligations, 
              and liabilities.
            </p>

            <h2>Limitation of Liability</h2>
            <p>
              In no event shall the church or its suppliers be liable for any damages arising out of 
              the use or inability to use the materials on this system.
            </p>

            <h2>Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us through 
              your church's designated contact methods.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}