"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MapPin, Bookmark } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/navbar/footer";

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { image: "/Convocation1/selected4.jpg" },
    { image: "/Convocation3/convo1.jpg" },
    { image: "/Convocation3/convo2.jpg" },
    { image: "/Convocation3/convo3.jpg" },
    { image: "/Convocation3/convo4.jpg" },
    { image: "/Convocation1/selected5.jpg" },
  ];

  // Auto Slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % slides.length);

  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const officials = [
    {
      name: "Shri Om Prakash Mathur",
      role: "Hon'ble Governor of Sikkim",
      image: "/home/governor-150x150.jpg",
      description: "Leading with vision and dedication",
    },
    {
      name: "Shri Prem Singh Tamang",
      role: "Hon'ble Chief Minister of Sikkim",
      image: "/home/cm-150x150.jpg",
      description: "Driving progress and innovation",
    },
    {
      name: "Shri Raju Basnet",
      role: "Hon'ble Education Minister, Govt. of Sikkim",
      image: "/home/RajuBasnet.jpg",
      description: "Shaping the future of education",
    },
  ];

  const institutes = [
    {
      name: "Advanced Technical Training Centre (ATTC)",
      location: "Bardang, Pakyong District",
      courses: [
        "Diploma In Mechanical Engineering",
        "Diploma In Mechatronics",
        "Diploma in Civil Engineering",
        "Diploma In Computer Engineering",
      ],
    },
    {
      name: "Centre for Computers and Communication Technology (CCCT)",
      location: "Chisopani, Namchi District",
      courses: [
        "Diploma In Electrical and Electronics Engineering",
        "Diploma In Computer Science and Technology",
        "Diploma In Electronics and Communication Engineering",
      ],
    },
  ];

  return (
    <>
      <ScrollArea className="h-screen">
        <div className="min-h-screen bg-gray-50">

          {/* HERO SECTION */}
          <div className="relative w-full h-[80vh] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div
                  className="relative w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${slides[currentSlide].image})`,
                  }}
                >
                  <div className="absolute inset-0 bg-black/60" />

                  {/* Centered Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                    <h1 className="text-3xl md:text-6xl font-extrabold text-white tracking-wide">
                      STATE BOARD OF TECHNICAL EDUCATION
                    </h1>

                    <h2 className="mt-4 text-xl md:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                      SIKKIM
                    </h2>

                    <p className="mt-6 text-lg md:text-xl text-gray-200 max-w-2xl">
                      Excellence in Technical Education & Skill Development
                    </p>
                  </div>

                  {/* Navigation */}
                  <div className="absolute inset-0 flex items-center justify-between px-6">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                      onClick={prevSlide}
                    >
                      <ChevronLeft className="h-8 w-8" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                      onClick={nextSlide}
                    >
                      <ChevronRight className="h-8 w-8" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Indicators */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    currentSlide === index
                      ? "w-8 bg-yellow-400"
                      : "w-3 bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* LEADERSHIP */}
          <section className="py-16">
            <div className="container mx-auto px-4 text-center mb-12">
              <h2 className="text-3xl font-bold text-green-700">
                Our Leadership
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
              {officials.map((profile, index) => (
                <motion.div key={index} whileHover={{ y: -8 }}>
                  <Card className="shadow-lg hover:shadow-2xl transition-all">
                    <CardContent className="p-6 text-center">
                      <div className="w-36 h-36 mx-auto rounded-full overflow-hidden border-4 border-green-200 mb-4">
                        <img
                          src={profile.image}
                          alt={profile.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-xl font-bold text-green-700">
                        {profile.name}
                      </h3>
                      <Badge className="mt-2 bg-green-600 text-white">
                        {profile.role}
                      </Badge>
                      <p className="text-gray-600 mt-3">
                        {profile.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* INSTITUTES */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4 text-center mb-12">
              <h2 className="text-3xl font-bold text-blue-700">
                Technical Institutes
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4">
              {institutes.map((institute, index) => (
                <Card key={index} className="shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-700">
                      <Bookmark className="h-5 w-5 text-blue-600" />
                      {institute.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4 text-red-500" />
                      {institute.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {institute.courses.map((course, idx) => (
                      <div key={idx} className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-blue-600" />
                        {course}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* ABOUT SECTION */}
<section className="py-16 bg-gray-50">
  <div className="container mx-auto px-4">

    <Tabs defaultValue="about" className="w-full">
      
      <TabsList className="grid w-full grid-cols-3 bg-gray-200 p-1 rounded-lg">
        <TabsTrigger
          value="about"
          className="data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-md"
        >
          About SBTE
        </TabsTrigger>

        <TabsTrigger
          value="achievements"
          className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
        >
          Achievements
        </TabsTrigger>

        <TabsTrigger
          value="vision"
          className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md"
        >
          Vision
        </TabsTrigger>
      </TabsList>

      {/* ABOUT */}
        <TabsContent value="about" className="mt-6">
          <Card className="shadow-md border-t-4 border-green-600">
            <CardHeader>
              <CardTitle className="text-green-700">
                About SBTE
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                The State Board of Technical Education (SBTE) was constituted in 2002 
                to advise the State Government on all matters related to technical education.
              </p>

              <p>
                Currently, the state has government-run technical institutes 
                affiliated under SBTE which oversee academic and diploma certification activities.
              </p>

              <div className="space-y-3 mt-4">
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-600 mt-2"></div>
                  <p>
                    <span className="font-semibold">
                      Advanced Technical Training Centre (ATTC)
                    </span> – Bardang, Pakyong District.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-600 mt-2"></div>
                  <p>
                    <span className="font-semibold">
                      Centre for Computers & Communication Technology (CCCT)
                    </span> – Chisopani, Namchi District.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ACHIEVEMENTS */}
        <TabsContent value="achievements" className="mt-6">
          <Card className="shadow-md border-t-4 border-blue-600">
            <CardHeader>
              <CardTitle className="text-blue-700">
                Key Achievements
              </CardTitle>
            </CardHeader>

            <CardContent>
              <ul className="space-y-4 text-gray-700">
                {[
                  "First, Second and Third Convocations (2023–2025)",
                  "Uniform Grading System Implementation",
                  "Curriculum aligned with NEP 2020 & AICTE",
                  "Regular Awarding of Diploma Certificates",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* VISION */}
        <TabsContent value="vision" className="mt-6">
          <Card className="shadow-md border-t-4 border-purple-600">
            <CardHeader>
              <CardTitle className="text-purple-700">
                Vision for the Future
              </CardTitle>
            </CardHeader>

            <CardContent>
              <ul className="space-y-4 text-gray-700">
                {[
                  "Technological Advancement & MIS Implementation",
                  "Industry Collaboration",
                  "Accessibility & Inclusivity",
                  "Promotion of Technical Institutes",
                  "Regular Convocations",
                ].map((vision, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-purple-600" />
                    {vision}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  </section>


        </div>
        <Footer />
      </ScrollArea>
    </>
  );
}
