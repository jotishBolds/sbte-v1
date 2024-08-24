import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Users, Award } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-[90vh]  flex flex-col">
      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-gray-900 leading-tight">
            Welcome to the <span className="text-blue-600">SBTE</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Streamline your college administration with our comprehensive
            management solution.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
              >
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/about">
              <Button
                size="lg"
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 w-full sm:w-auto"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <section className="py-12 px-4 md:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpen,
                title: "Course Management",
                description: "Easily manage courses, schedules, and curricula.",
              },
              {
                icon: Users,
                title: "Student Information",
                description:
                  "Maintain comprehensive student records and profiles.",
              },
              {
                icon: Award,
                title: "Performance Tracking",
                description:
                  "Monitor and analyze student and faculty performance.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm"
              >
                <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-6 px-4 md:px-8 bg-gray-100 text-center text-gray-600">
        <p>&copy; 2024 SBTE. All rights reserved.</p>
      </footer>
    </div>
  );
}
