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
    <div className="container mx-auto px-4 py-8">
      {/* Introduction Section */}
      <section className="mb-12">
        <h1 className="text-4xl font-bold mb-6">
          State Board of Technical Education
        </h1>
        <Card>
          <CardHeader>
            <CardTitle>Introduction</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="">
              The State Board of Technical Education (SBTE) was constituted in
              2002 vide Notification no. GOS/DTE/2002/IV (2)/212, dated
              24/8/2002 to advice the Government in all matters relating to the
              technical education in the State. It started functioning from 2017
              onwards with a creation of small working cell in the top floor of
              Education Department with few members posted here.
            </p>
            <p className="mt-4">
              At present the state has only three technical colleges under the
              Government, out of which two are polytechnics and one Engineering
              College. The two polytechnics namely Advanced Technical Training
              Centre (ATTC) at Bardang, Pakyong District and Centre for
              Computers and Communication Technology (CCCT), at Chisopani,
              Namchi District along with Sikkim Institute of Science and
              Technology (SIST), Chisopani, Namch District respectively. The
              SIST is a degree engineering college which follows the academic
              curriculum guidelines of Sikkim University and faculty guidelines
              as per AICTE norms. ATTC and CCCT are polytechnics which is
              affiliated with SBTE and falls under the purview of SBTE. The
              Diploma Certificate is awarded by State Board of Technical
              Education for these two polytechnics.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Technical Institutions Section */}
      <section className="mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Technical Institutions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className=" mb-6">
              Currently, the state has three technical colleges under the
              Government:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-2">ATTC</h3>
                <p className="text-sm ">
                  Advanced Technical Training Centre at Bardang, Pakyong
                  District
                </p>
              </Card>
              <Card className="p-4">
                <h3 className="font-semibold mb-2">CCCT</h3>
                <p className="text-sm ">
                  Centre for Computers and Communication Technology at
                  Chisopani, Namchi District
                </p>
              </Card>
              <Card className="p-4">
                <h3 className="font-semibold mb-2">SIST</h3>
                <p className="text-sm ">
                  Sikkim Institute of Science and Technology at Chisopani,
                  Namchi District
                </p>
              </Card>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Courses Section */}
      <section className="mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Available Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {polytechnicCourses.map((poly, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{poly.name}</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-6">
                      {poly.courses.map((course, courseIndex) => (
                        <li key={courseIndex} className="mb-2">
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

      {/* Achievements Section */}
      <section className="mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Key Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold mb-2">Historic Convocations</h3>
                <p className="">
                  Successfully conducted first and second-ever convocations in
                  2023 and 2024, marking significant milestones in the
                  institution&apos;s history.
                </p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold mb-2">Standardized Evaluation</h3>
                <p className="">
                  Implemented a uniform grading system across ATTC and CCCT to
                  ensure consistency and fairness.
                </p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold mb-2">Updated Curriculum</h3>
                <p className="">
                  Revised syllabi and curricula for all 10 courses as per NEP 20
                  and AICTE guidelines to meet contemporary industry demands.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Vision Section */}
      <section className="mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Our Vision</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold">Digital Transformation</h3>
                <p className="">
                  Implementation of comprehensive Management Information System
                  (MIS) for enhanced efficiency.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Industry Collaboration</h3>
                <p className="">
                  Conducting short trainings and internship programs during
                  semester breaks.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Accessibility</h3>
                <p className="">
                  Providing scholarships and support for economically backward
                  students.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Promotion</h3>
                <p className="">
                  Expanding reach through social media, hoardings, and rural
                  area counselling.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default AboutPage;
