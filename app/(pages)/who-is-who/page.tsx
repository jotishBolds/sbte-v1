import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface StaffMember {
  name: string;
  position: string;
  description: string;
  imageUrl: string;
}

const staffMembers: StaffMember[] = [
  {
    name: "Director of Technical Education",
    position: "Director cum Member Secretary, SBTE",
    description:
      "Leading the board with strategic vision and administrative expertise, the Director ensures the effective governance and advancement of technical education in the region.",
    imageUrl: "/api/placeholder/300/300",
  },
  {
    name: "Shri Sonam Chopel Bhutia",
    position: "Controller of Examination",
    description:
      "Overseeing examination processes and upholding the integrity of assessments, Shri Bhutia plays a pivotal role in maintaining academic standards.",
    imageUrl: "/api/placeholder/300/300",
  },
  {
    name: "Mrs. Rita D. Dhakal",
    position: "Registrar",
    description:
      "As Registrar, Mrs. Dhakal manages the administrative framework, ensuring seamless operations and supporting institutional growth.",
    imageUrl: "/home/RituDDhakal.jpg",
  },
];

export default function WhoIsWho() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="space-y-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Leadership Team
            </h1>
            <p className="text-lg">
              The State Board of Technical Education (SBTE) thrives under the
              guidance of experienced professionals dedicated to advancing
              technical education in Sikkim.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {staffMembers.map((member, index) => (
              <Card
                key={index}
                className="hover:shadow-xl transition-shadow duration-300 ease-in-out border-0"
              >
                <CardHeader className="space-y-6 text-center pt-8">
                  <div className="flex justify-center">
                    <Avatar className="w-40 h-40 border-4 shadow-lg">
                      <AvatarImage
                        src={member.imageUrl}
                        alt={member.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-2xl text-primary">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold leading-tight">
                      {member.name}
                    </h2>
                    <p className="text-sm font-medium text-primary">
                      {member.position}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-8">
                  <p className="text-sm leading-relaxed">
                    {member.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
