import { FormEventHandler } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { CheckCircle2, MailIcon } from "lucide-react";
import GuestLayout from "@/Layouts/GuestLayout";

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route("verification.send"));
    };

    return (
        <GuestLayout>
            <Head title="Email Verification" />

            <CardHeader className="space-y-1 p-0 mb-6">
                <div className="flex justify-center mb-3">
                    <div className="h-16 w-16 rounded-full bg-[#6db64e]/10 flex items-center justify-center">
                        <MailIcon className="h-8 w-8 text-[#6db64e]" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold text-center text-[#6db64e]">
                    Verify Your Email
                </CardTitle>
                <CardDescription className="text-center text-gray-500">
                    One more step to complete your registration
                </CardDescription>
            </CardHeader>

            <div className="mb-4 p-4 bg-gray-50 border border-gray-100 rounded-md text-sm text-gray-600">
                Thanks for signing up! Please verify your email address by
                clicking on the link we just emailed to you.
                <br />
                <br />
                If you didn't receive the email, we can send you another one.
            </div>

            {status === "verification-link-sent" && (
                <div className="mb-4 p-4 bg-green-50 border border-green-100 rounded-md flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-green-700">
                        A new verification link has been sent to the email
                        address you provided during registration.
                    </div>
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-full sm:w-auto bg-[#6db64e] hover:bg-[#5a9840] text-white"
                    >
                        Resend Verification Email
                    </Button>

                    <Link
                        href={route("logout")}
                        method="post"
                        as="button"
                        className="text-sm text-gray-600 hover:text-[#6db64e] hover:underline transition-colors w-full sm:w-auto text-center"
                    >
                        Log Out
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
