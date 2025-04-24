import { PropsWithChildren } from "react";
import { Card } from "@/Components/ui/card";

export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center bg-white p-4">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <img
                        src="/assets/logo-white.jpg"
                        alt="Logo"
                        className="h-16 w-auto"
                    />
                </div>

                <Card className="w-full p-6 bg-white shadow-xl rounded-lg">
                    {children}
                </Card>
            </div>
        </div>
    );
}
