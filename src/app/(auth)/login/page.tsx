import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export const metadata = { title: "Sign In | CRNA Board Study" };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">CRNA Board Study</h1>
          <p className="text-gray-500 mt-2">Sign in to continue studying</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense>
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
