import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface CourseInfo {
  name: string;
  courses: string[];
}

const polytechnicCourses: CourseInfo[] = [
  {
    name: "ATTC",
    courses: [
      "Diploma In Mechanical Engineering",
      "Diploma In Mechatronics",
      "Diploma in Civil Engineering",
      "Diploma In Computer Engineering",
      "Diploma In Manufacturing Engineering",
    ],
  },
  {
    name: "CCCT",
    courses: [
      "Diploma In Mechanical Engineering",
      "Diploma In Electrical and Electronics Engineering",
      "Diploma in Civil Engineering",
      "Diploma In Computer Science and Technology",
      "Diploma In Electronics and Communication Engineering",
    ],
  },
];

const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-10 space-y-16">

      {/* Introduction */}
      <section>
        <h1 className="text-4xl font-extrabold mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          About State Board of Technical Education
        </h1>

        <Card className="shadow-lg border-t-4 border-green-600">
          <CardHeader>
            <CardTitle className="text-green-700">
              Introduction
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700 leading-relaxed space-y-4">
            <p>
            The State Board of Technical Education (SBTE) was constituted in 2002 vide Notification no. GOS/DTE/2002/IV (2)/212, 
            dated 24/8/2002 to advice the Government in all matters relating to the technical education in the State. It started 
            functioning from 2017 onwards with a creation of small working cell in the top floor of Education Department with few 
            members posted here.
            </p>
            <p>
            At present the state has only three technical colleges under the Government, 
            out of which two are polytechnics and one Engineering College. The two polytechnics namely Advanced Technical Training Centre (ATTC) 
            at Bardang, Pakyong District and Centre for Computers and Communication Technology (CCCT), at Chisopani, Namchi District along with Sikkim Institute of Science and Technology (SIST), Chisopani, Namch District respectively. The SIST is a degree engineering college which follows the academic curriculum guidelines of Sikkim University and faculty guidelines as per AICTE norms. ATTC and CCCT are polytechnics which is affiliated with SBTE and falls under the purview of SBTE. 
            The Diploma Certificate is awarded by State Board of Technical Education for these two polytechnics
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Technical Institutions */}
      <section>
        <Card className="shadow-lg border-t-4 border-blue-600">
          <CardHeader>
            <CardTitle className="text-blue-700">
              Technical Institutions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
                Currently, the state has three technical colleges under the Government:
              </div>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-4 bg-green-50 hover:shadow-md transition">
                <h3 className="font-semibold text-green-700 mb-2">ATTC</h3>
                <p className="text-sm text-gray-700">
                  Advanced Technical Training Centre at Bardang, Pakyong District
                </p>
              </Card>

              <Card className="p-4 bg-blue-50 hover:shadow-md transition">
                <h3 className="font-semibold text-blue-700 mb-2">CCCT</h3>
                <p className="text-sm text-gray-700">
                 Centre for Computers and Communication Technology at Chisopani, Namchi District
                </p>
              </Card>

              <Card className="p-4 bg-purple-50 hover:shadow-md transition">
                <h3 className="font-semibold text-purple-700 mb-2">SIST</h3>
                <p className="text-sm text-gray-700">
                  Sikkim Institute of Science and Technology at Chisopani, Namchi District
                </p>
              </Card>

            </div>
          </CardContent>
        </Card>
      </section>

      {/* Courses */}
      <section>
        <Card className="shadow-lg border-t-4 border-orange-600">
          <CardHeader>
            <CardTitle className="text-orange-700">
              Available Courses
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {polytechnicCourses.map((poly, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-lg font-semibold text-orange-600">
                    {poly.name}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 pl-4">
                      {poly.courses.map((course, courseIndex) => (
                        <li
                          key={courseIndex}
                          className="flex items-center gap-2 text-gray-700"
                        >
                          <div className="h-2 w-2 rounded-full bg-orange-500" />
                          {course}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </section>

      {/* Achievements */}
      <section>
        <Card className="shadow-lg border-t-4 border-pink-600">
          <CardHeader>
            <CardTitle className="text-pink-700">
              Key Achievements
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {[
              {
                title: "Historic Convocations",
                text: "Successfully conducted First, Second-ever and Third convocations in 2023,2024 & 2025, marking significant milestones in the institution's history.",
              },
              {
                title: "Standardized Evaluation",
                text: "Implemented a uniform grading system across ATTC and CCCT to ensure consistency and fairness.",
              },
              {
                title: "Updated Curriculum",
                text: "Revised syllabi and curricula for all 10 courses as per NEP 20 and AICTE guidelines to meet contemporary industry demands.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="border-l-4 border-pink-600 pl-4"
              >
                <h3 className="font-semibold text-pink-700 mb-1">
                  {item.title}
                </h3>
                <p className="text-gray-700">{item.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Vision */}
      <section>
        <Card className="shadow-lg border-t-4 border-indigo-600">
          <CardHeader>
            <CardTitle className="text-indigo-700">
              Our Vision
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                "Digital Transformation (MIS)",
                "Industry Collaboration",
                "Accessibility & Scholarships",
                "Promotion of Technical Institutes",
              ].map((vision, index) => (
                <div
                  key={index}
                  className="bg-indigo-50 p-4 rounded-lg hover:shadow-md transition"
                >
                  <h3 className="font-semibold text-indigo-700">
                    {vision}
                  </h3>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

    </div>
  );
};

export default AboutPage;
