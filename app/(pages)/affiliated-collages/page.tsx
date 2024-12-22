import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, GraduationCap, Laptop, School } from "lucide-react";

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
    <Card className="w-full h-64 flex flex-col items-center justify-center text-center p-6">
      <CardContent className="space-y-4">
        <GraduationCap className="w-16 h-16 mx-auto" />
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-primary">
          Will be affiliated soon. Stay tuned for updates!
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Affiliated Colleges</h1>

      <Tabs defaultValue="polytechnic" className="w-full">
        <TabsList className="flex flex-col sm:grid sm:grid-cols-3 gap-2 sm:gap-0 h-auto">
          <TabsTrigger
            value="polytechnic"
            className="flex items-center justify-center gap-2 w-full"
          >
            <School className="h-4 w-4" />
            <span className="hidden sm:inline">Polytechnic</span>
            <span className="sm:hidden">Polytechnic Colleges</span>
          </TabsTrigger>
          <TabsTrigger
            value="skilldev"
            className="flex items-center justify-center gap-2 w-full"
          >
            <Laptop className="h-4 w-4" />
            <span className="hidden sm:inline">Skill Development</span>
            <span className="sm:hidden">Skill Development Centers</span>
          </TabsTrigger>
          <TabsTrigger
            value="vocational"
            className="flex items-center justify-center gap-2 w-full"
          >
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Vocational</span>
            <span className="sm:hidden">Vocational Centers</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="polytechnic" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {polytechnics.map((poly) => (
              <Card key={poly.name} className="flex flex-col">
                <CardHeader className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <img
                      src={poly.href}
                      alt={poly.logoAlt}
                      className="w-20 h-20 object-contain"
                    />
                  </div>
                  <div className="text-center sm:text-left">
                    <CardTitle className="text-xl">{poly.name}</CardTitle>
                    <p className="text-sm text-primary">{poly.location}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold mb-2">Courses Offered:</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    {poly.courses.map((course) => (
                      <li key={course} className="text-sm">
                        {course}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="skilldev" className="mt-6">
          <ComingSoonCard title="Skill Development Centers" />
        </TabsContent>

        <TabsContent value="vocational" className="mt-6">
          <ComingSoonCard title="Vocational Training Institutes" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AffiliatedCollegesPage;
