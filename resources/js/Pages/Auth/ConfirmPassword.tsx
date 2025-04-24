import { FormEventHandler } from "react";
import { Head, useForm } from "@inertiajs/react";
import { CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { AlertCircle } from "lucide-react";
import InputError from "@/Components/InputError";
import GuestLayout from "@/Layouts/GuestLayout";

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: "",
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route("password.confirm"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <GuestLayout>
            <Head title="Confirm Password" />

            <CardHeader className="space-y-1 p-0 mb-4">
                <CardTitle className="text-2xl font-bold text-center text-[#6db64e]">
                    Security Check
                </CardTitle>
                <CardDescription className="text-center text-gray-500">
                    Please confirm your password to continue
                </CardDescription>
            </CardHeader>

            <div className="mb-4 p-4 bg-amber-50 border border-amber-100 rounded-md flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-700">
                    This is a secure area of the application. Please confirm
                    your password before continuing.
                </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700">
                        Password
                    </Label>
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="w-full border-gray-300 focus:border-[#6db64e] focus:ring-[#6db64e]"
                        placeholder="••••••••"
                        onChange={(e) => setData("password", e.target.value)}
                        required
                    />
                    <InputError message={errors.password} className="mt-1" />
                </div>

                <Button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-[#6db64e] hover:bg-[#5a9840] text-white"
                >
                    Confirm Password
                </Button>
            </form>
        </GuestLayout>
    );
}
