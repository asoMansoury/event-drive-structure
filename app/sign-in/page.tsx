"use client"

import React, { useState } from 'react'
import {useSignIn} from '@clerk/nextjs'
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input';
import { Card,CardContent,CardDescription,CardFooter,CardHeader,CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff } from 'lucide-react';

export default function SingIn() {
    const {isLoaded,signIn,setActive} = useSignIn();
    const router = useRouter();
    const [emailAddress, setEmailAddress] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState<string | null>(null);
    const [showPassword,setShowPassword] = useState(false);

    if(!isLoaded) {
        return null;
    }

    async function submit(e:React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if(!isLoaded) {
            return ;
        }


        // Handle sign-in logic here
        // For example, you might call a sign-in function from Clerk
        // await signIn.signIn({ emailAddress, password });
        
        // After successful sign-in, redirect to the dashboard or another page
        try {
            const result = await signIn.create({
                identifier: emailAddress,
                password
            });

            if (result.status === 'complete') {
                await setActive({
                    session: result.createdSessionId,
                });
                router.push('/dashboard');
            } else {
                console.error("Sign-in not complete:", JSON.stringify(result));
            }
        }catch (error:any) {
            console.error("Sign-in error:", JSON.stringify(error));
            setError(error.errors[0].message);
        }
    }

    return (
        <div className='flex items-center justify-center min-h-screen bg-background' 
        >
            <Card className='w-full max-w-md'>
                <CardHeader>
                    <CardTitle className='text-2xl font-bold text-center'>
                        Sing In to Todo Master
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className='space-y-4'>
                        <div className='space-y-2'>
                            <label htmlFor='email'>Email</label>
                            <Input
                                type='email'
                                id='email'
                                value={emailAddress}
                                onChange={(e) => setEmailAddress(e.target.value)}
                                required/>
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='password'>Password</Label>
                            <div className='relative'>
                                <Input
                                    type='password'
                                    id='password'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <Button
                                    variant='ghost'
                                    className='absolute right-2 top-1/2 -translate-y-1/2'
                                    onClick={() => setPassword('')}
                                >
                                    {
                                        showPassword ? <Eye className='h-4 w-4 text-gray-500'  /> : 
                                        <EyeOff className='h-4 w-4 text-gray-500' />
                                    }
                                </Button>
                            </div>
                        </div>
                        {error && (
                            <Alert variant='destructive'>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <Button type='submit' className='w-full'>
                            Sign In
                            </Button>
                    </form>
                </CardContent>
                <CardFooter className='justify-center'>
                    <p className='text-sm text-muted-foreground'>
                        Don't have an account?{' '}
                        <Link href='/sign-up' className='text-primary underline'>
                            Sign Up
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
