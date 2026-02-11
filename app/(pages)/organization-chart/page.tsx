"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const OrganizationChartPage = () => {
  return (
    <div className="min-h-screen">

      {/* ================= HEADER SECTION ================= */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-12">

          {/* Gradient Title (No Background Color) */}
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            State Board of Technical Education
          </h1>

          <h2 className="text-lg md:text-xl mt-3 font-semibold text-gray-700">
            Organization Structure
          </h2>

          {/* Description */}
          <div className="mt-6 max-w-3xl text-gray-700 leading-relaxed space-y-4">
            <p>
              The State Board of Technical Education (SBTE) was established in
              2002 to guide technical education in Sikkim. Operating since 2017,
              it oversees two polytechnics under its governance.
            </p>

            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="h-3 w-3 rounded-full bg-green-600 mt-2"></div>
                <span>
                  Advanced Technical Training Centre (ATTC) – Bardang, Pakyong District
                </span>
              </li>

              <li className="flex items-start gap-3">
                <div className="h-3 w-3 rounded-full bg-blue-600 mt-2"></div>
                <span>
                  Centre for Computers and Communication Technology (CCCT) – 
                  Chisopani, Namchi District
                </span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* ================= PDF VIEWER SECTION ================= */}
      <section className="container mx-auto px-4 py-12">
        <Card className="w-full shadow-lg border-0 overflow-hidden">

          {/* Accent Line */}
          <div className="h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500" />

          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Organization Chart
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <div className="w-full min-h-[600px] rounded-lg overflow-hidden border shadow-inner">
              <iframe
                src="/Organization-Chart.pdf"
                className="w-full h-full border-0"
                title="Organization Chart PDF"
                style={{ minHeight: "600px" }}
              />
            </div>
          </CardContent>

        </Card>
      </section>

    </div>
  );
};

export default OrganizationChartPage;
