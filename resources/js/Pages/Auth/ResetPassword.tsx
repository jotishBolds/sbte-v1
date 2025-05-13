import { FormEventHandler } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import InputError from "@/Components/InputError";
import GuestLayout from "@/Layouts/GuestLayout";

export default function ResetPassword({
    token,
    email,
}: {
    token: string;
    email: string;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: "",
        password_confirmation: "",
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route("password.store"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <GuestLayout>
            <Head title="Reset Password" />

            <CardHeader className="space-y-1 p-0 mb-6">
                <CardTitle className="text-2xl font-bold text-center text-[#6db64e]">
                    Reset Password
                </CardTitle>
                <CardDescription className="text-center text-gray-500">
                    Create a new secure password for your account
                </CardDescription>
            </CardHeader>

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
                        className="w-full border-gray-300 focus:border-[#6db64e] focus:ring-[#6db64e] bg-gray-50"
                        autoComplete="username"
                        readOnly
                    />
                    <InputError message={errors.email} className="mt-1" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700">
                        New Password
                    </Label>
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="w-full border-gray-300 focus:border-[#6db64e] focus:ring-[#6db64e]"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        onChange={(e) => setData("password", e.target.value)}
                        required
                    />
                    <InputError message={errors.password} className="mt-1" />
                </div>

                <div className="space-y-2">
                    <Label
                        htmlFor="password_confirmation"
                        className="text-gray-700"
                    >
                        Confirm New Password
                    </Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="w-full border-gray-300 focus:border-[#6db64e] focus:ring-[#6db64e]"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        onChange={(e) =>
                            setData("password_confirmation", e.target.value)
                        }
                        required
                    />
                    <InputError
                        message={errors.password_confirmation}
                        className="mt-1"
                    />
                </div>

                <Button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-[#6db64e] hover:bg-[#5a9840] text-white"
                >
                    Reset Password
                </Button>
            </form>
        </GuestLayout>
    );
}
