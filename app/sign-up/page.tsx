"use client"

import React from 'react'
import {useSignUp} from '@clerk/nextjs'
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input';
import { Card,CardContent,CardDescription,CardFooter,CardHeader,CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff } from 'lucide-react';

export default function SignUp() {
  const {isLoaded,signUp, setActive} = useSignUp();
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPedingVerification] = React.useState(false);
  const [code,setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const router = useRouter();


  if(!isLoaded) {
    return null;
  }

  async function submit(e:React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if(!isLoaded) {
        return ;
    }
    setError(null);
    setPedingVerification(true);

    try {
      await signUp.create({
        emailAddress,
        password
      });

      await signUp.prepareEmailAddressVerification({strategy: "email_code"});




    }catch (error) {
      setError("An error occurred while signing up. Please try again.");
      setPedingVerification(false);
      return;
    }
  }

  async function onPressVerify(e:React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if(!isLoaded) {
        return ;
    }
    setError(null);
    try {
      const completeSignup =  await signUp.attemptEmailAddressVerification({code});
      if(completeSignup.status !== "complete") {
        console.error("Verification failed", JSON.stringify(completeSignup, null, 2));
      }
      
      const sessionId = completeSignup.createdSessionId;
      if(completeSignup.status === "complete") {
        await setActive({session: sessionId});
        router.push("/dashboard");
      }


    }catch (error) {
      console.error("Error during email verification", JSON.stringify(error, null, 2));
      setError("An error occurred while verifying your email. Please try again.");
    }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Sign Up for Todo Master
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!pendingVerification ? (
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full">
                Sign Up
              </Button>
            </form>
          ) : (
            <form onSubmit={onPressVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter verification code"
                  required
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full">
                Verify Email
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
  }
}
