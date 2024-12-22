import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const OrganizationChartPage = () => {
  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <section className=" border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold ">
            State Board of Technical Education - Organization Structure
          </h1>
          <div className="prose max-w-none">
            <p className="mb-2">
              The State Board of Technical Education (SBTE) was established in
              2002 to guide technical education in Sikkim. Operating since 2017,
              it oversees two polytechnics and one engineering college:
            </p>
            <ul className=" list-disc pl-6 mb-4">
              <li>
                Advanced Technical Training Centre (ATTC) - Bardang, Pakyong
                District
              </li>
              <li>
                Centre for Computers and Communication Technology (CCCT) -
                Chisopani, Namchi District
              </li>
              <li>
                Sikkim Institute of Science and Technology (SIST) - Chisopani,
                Namchi District
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* PDF Viewer Section */}
      <section className="container mx-auto px-4 py-8">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Organization Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full aspect-[16/9]  rounded-lg overflow-hidden">
              <iframe
                src="/Organization-Chart.pdf"
                className="w-full h-full border-0"
                title="Organization Chart PDF"
              />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default OrganizationChartPage;
