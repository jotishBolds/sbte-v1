"use client";
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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
      "Leading the board with strategic vision and administrative expertise, ensuring effective governance and advancement of technical education.",
    imageUrl: "/home/director.png",
  },
  {
    name: "Shri Sonam Chopel Bhutia",
    position: "Controller of Examination",
    description:
      "Overseeing examination processes and upholding the integrity of assessments while maintaining academic standards.",
    imageUrl: "/home/controller.jpeg",
  },
  {
    name: "Mrs. Rita D. Dhakal",
    position: "Registrar",
    description:
      "Managing administrative framework and ensuring seamless operations supporting institutional growth.",
    imageUrl: "/home/RituDDhakal.jpg",
  },
];

export default function WhoIsWho() {
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    e.currentTarget.style.display = "none";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16 max-w-7xl">

        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Leadership Team
          </h1>
          <p className="text-lg text-gray-600 mt-4">
            The State Board of Technical Education (SBTE) thrives under the
            guidance of experienced professionals dedicated to advancing
            technical education in Sikkim.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {staffMembers.map((member, index) => (
            <Card
              key={index}
              className="relative hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-2xl border-0 bg-white overflow-hidden"
            >
              {/* Top Gradient Line */}
              <div className="h-2 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500" />

              <CardHeader className="space-y-6 text-center pt-8">
                <div className="flex justify-center">
                  <div className="p-1 rounded-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500">
                    <Avatar className="w-40 h-40 border-4 border-white shadow-lg">
                      <AvatarImage
                        src={member.imageUrl}
                        alt={member.name}
                        className="object-cover"
                        onError={handleImageError}
                      />
                      <AvatarFallback className="text-2xl font-bold text-green-700 bg-green-100">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-800">
                    {member.name}
                  </h2>

                  <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1 text-xs">
                    {member.position}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="px-6 pb-8">
                <p className="text-sm leading-relaxed text-gray-600 text-center">
                  {member.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
}
