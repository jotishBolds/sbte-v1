import { FormEventHandler } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import InputError from "@/Components/InputError";
import GuestLayout from "@/Layouts/GuestLayout";

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route("password.email"));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <CardHeader className="space-y-1 p-0 mb-4">
                <CardTitle className="text-2xl font-bold text-center text-[#6db64e]">
                    Forgot Password
                </CardTitle>
                <CardDescription className="text-center text-gray-500">
                    Enter your email to receive a password reset link
                </CardDescription>
            </CardHeader>

            <div className="mb-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-md">
                We'll send you a password reset link that will allow you to
                choose a new password.
            </div>

            {status && (
                <div className="mb-4 p-4 bg-green-50 text-sm font-medium text-green-600 rounded-md">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">
                        Email
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="w-full border-gray-300 focus:border-[#6db64e] focus:ring-[#6db64e]"
                        placeholder="your@email.com"
                        onChange={(e) => setData("email", e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-1" />
                </div>

                <div className="flex items-center justify-between">
                    <Link
                        href={route("login")}
                        className="text-sm text-[#6db64e] hover:underline"
                    >
                        Back to login
                    </Link>

                    <Button
                        type="submit"
                        disabled={processing}
                        className="bg-[#6db64e] hover:bg-[#5a9840] text-white"
                    >
                        Send Reset Link
                    </Button>
                </div>
            </form>
        </GuestLayout>
    );
}
