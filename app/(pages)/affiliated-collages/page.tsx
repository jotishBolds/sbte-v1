"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, GraduationCap, School } from "lucide-react";

const AffiliatedCollegesPage = () => {
  const polytechnics = [
    {
      name: "Advanced Technical Training Centre (ATTC)",
      location: "Bardang, Pakyong District",
      logoAlt: "ATTC Logo",
      href: "/home/logoattc.png",
      courses: [
        "Diploma In Mechanical Engineering",
        "Diploma In Mechatronics",
        "Diploma in Civil Engineering",
        "Diploma In Computer Engineering",
        "Diploma In Manufacturing Engineering",
      ],
    },
    {
      name: "Centre for Computers and Communication Technology (CCCT)",
      location: "Chisopani, Namchi District",
      logoAlt: "CCCT Logo",
      href: "/home/logoccct.png",
      courses: [
        "Diploma In Mechanical Engineering",
        "Diploma In Electrical and Electronics Engineering",
        "Diploma in Civil Engineering",
        "Diploma In Computer Science and Technology",
        "Diploma In Electronics and Communication Engineering",
      ],
    },
  ];

  const ComingSoonCard = ({ title }: { title: string }) => (
    <Card className="w-full h-64 flex flex-col items-center justify-center text-center p-6 shadow-lg border-0">
      <CardContent className="space-y-4">
        <GraduationCap className="w-16 h-16 mx-auto text-purple-600" />
        <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
        <p className="text-purple-600 font-medium">
          Will be affiliated soon. Stay tuned for updates!
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-10">

      {/* Gradient Title */}
      <h1 className="text-3xl md:text-4xl font-extrabold mb-8 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
        Affiliated Colleges
      </h1>

      <Tabs defaultValue="polytechnic" className="w-full">

        {/* Colorful Tabs */}
        <TabsList className="grid grid-cols-2 w-full bg-gray-100 p-1 rounded-lg">
          <TabsTrigger
            value="polytechnic"
            className="data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-md flex items-center justify-center gap-2"
          >
            <School className="h-4 w-4" />
            Polytechnic
          </TabsTrigger>

          <TabsTrigger
            value="vocational"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md flex items-center justify-center gap-2"
          >
            <Building2 className="h-4 w-4" />
            Vocational
          </TabsTrigger>
        </TabsList>

        {/* Polytechnic Tab */}
        <TabsContent value="polytechnic" className="mt-8">
          <div className="grid gap-8 md:grid-cols-2">
            {polytechnics.map((poly, index) => (
              <Card
                key={poly.name}
                className="flex flex-col shadow-lg hover:shadow-2xl transition-all duration-300 border-0 overflow-hidden"
              >
                {/* Accent Top Border */}
                <div className="h-2 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500" />

                <CardHeader className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center shadow-md">
                    <img
                      src={poly.href}
                      alt={poly.logoAlt}
                      className="w-20 h-20 object-contain"
                    />
                  </div>

                  <div className="text-center sm:text-left">
                    <CardTitle className="text-xl text-gray-800">
                      {poly.name}
                    </CardTitle>
                    <p className="text-sm font-medium text-green-600">
                      {poly.location}
                    </p>
                  </div>
                </CardHeader>

                <CardContent>
                  <h3 className="font-semibold mb-3 text-blue-600">
                    Courses Offered:
                  </h3>

                  <ul className="space-y-2">
                    {poly.courses.map((course) => (
                      <li
                        key={course}
                        className="flex items-center gap-2 text-sm text-gray-700"
                      >
                        <div className="h-2 w-2 rounded-full bg-purple-500" />
                        {course}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Vocational Tab */}
        <TabsContent value="vocational" className="mt-8">
          <ComingSoonCard title="Vocational Training Institutes" />
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default AffiliatedCollegesPage;
