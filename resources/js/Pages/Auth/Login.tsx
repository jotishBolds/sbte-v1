import { FormEventHandler } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Checkbox } from "@/Components/ui/checkbox";
import { Label } from "@/Components/ui/label";
import InputError from "@/Components/InputError";
import GuestLayout from "@/Layouts/GuestLayout";

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <CardHeader className="space-y-1 p-0 mb-6">
                <CardTitle className="text-2xl font-bold text-center text-[#6db64e]">
                    Welcome Back
                </CardTitle>
                <CardDescription className="text-center text-gray-500">
                    Enter your credentials to access your account
                </CardDescription>
            </CardHeader>

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
                        autoComplete="username"
                        placeholder="your@email.com"
                        onChange={(e) => setData("email", e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-1" />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-gray-700">
                            Password
                        </Label>
                        {canResetPassword && (
                            <Link
                                href={route("password.request")}
                                className="text-xs text-[#6db64e] hover:underline"
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="w-full border-gray-300 focus:border-[#6db64e] focus:ring-[#6db64e]"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        onChange={(e) => setData("password", e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-1" />
                </div>

                <div className="flex items-center">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="remember"
                            checked={data.remember}
                            onCheckedChange={(checked) =>
                                setData("remember", checked as boolean)
                            }
                        />
                        <Label
                            htmlFor="remember"
                            className="text-sm text-gray-600"
                        >
                            Remember me
                        </Label>
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-[#6db64e] hover:bg-[#5a9840] text-white"
                >
                    Sign In
                </Button>

                <div className="text-center text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link
                        href={route("register")}
                        className="text-[#6db64e] hover:underline"
                    >
                        Create an account
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
