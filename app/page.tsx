"use client";
import React, { useState } from "react";
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
    {
      image: "/Convocation1/selected5.jpg",
    },
    {
      image: "/Convocation1/selected4.jpg",
    },
  ];

  const officials = [
    {
      name: "Shri Om Prakash Mathur",
      role: "Hon'ble Governor",
      image: "/home/governor-150x150.jpg",
      description: "Leading with vision and dedication",
    },
    {
      name: "Shri Prem Singh Tamang",
      role: "Hon'ble Chief Minister",
      image: "/home/cm-150x150.jpg",
      description: "Driving progress and innovation",
    },
    {
      name: "Shri Raju Basnet",
      role: "Hon'ble Education Minister",
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
        "Diploma In Manufacturing Engineering",
      ],
    },
    {
      name: "Centre for Computers and Communication Technology (CCCT)",
      location: "Chisopani, Namchi District",
      courses: [
        "Diploma In Mechanical Engineering",
        "Diploma In Electrical and Electronics Engineering",
        "Diploma in Civil Engineering",
        "Diploma In Computer Science and Technology",
        "Diploma In Electronics and Communication Engineering",
      ],
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <>
      <ScrollArea className="h-screen">
        <div className="min-h-screen bg-background">
          {/* Hero Section */}
          <div className="relative w-full h-[70vh] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                className="absolute inset-0"
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ duration: 0.5 }}
              >
                <div
                  className="relative w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${slides[currentSlide].image})`,
                  }}
                >
                  <div className="absolute inset-0">
                    <div className="container mx-auto h-full flex items-center justify-between px-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10"
                        onClick={prevSlide}
                      >
                        <ChevronLeft className="h-8 w-8" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10"
                        onClick={nextSlide}
                      >
                        <ChevronRight className="h-8 w-8" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slide Indicators */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentSlide === index ? "w-6 bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Rest of the sections remain unchanged */}
          {/* Leadership Section */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-primary">
                  Our Leadership
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Guiding Sikkim&apos;s Technical Education
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {officials.map((profile, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card className="relative overflow-hidden border-0 shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center">
                          <div className="w-40 h-40 rounded-full overflow-hidden mb-6 border-4 border-primary/10">
                            <img
                              src={profile.image}
                              alt={profile.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <h3 className="text-xl font-bold text-primary mb-2">
                            {profile.name}
                          </h3>
                          <Badge variant="secondary" className="mb-3">
                            {profile.role}
                          </Badge>
                          <p className="text-muted-foreground text-center">
                            {profile.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Institutes Section */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-primary">
                  Technical Institutes
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Excellence in Technical Education
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {institutes.map((institute, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bookmark className="h-5 w-5 text-primary" />
                          {institute.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {institute.location}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {institute.courses.map((course, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-gray-600"
                            >
                              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                              {course}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* About Section */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <Tabs defaultValue="about" className="max-w-auto mx-auto">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="about">About SBTE</TabsTrigger>
                  <TabsTrigger value="achievements">Achievements</TabsTrigger>
                  <TabsTrigger value="vision">Vision</TabsTrigger>
                </TabsList>

                <TabsContent value="about">
                  <Card>
                    <CardHeader>
                      <CardTitle>About SBTE</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none">
                      <p className="text-muted-foreground leading-relaxed">
                        The State Board of Technical Education (SBTE) was
                        constituted in 2002 to advise the Government in all
                        matters relating to technical education in the State. It
                        started functioning from 2017 onwards with a creation of
                        small working cell in the top floor of Education
                        Department with few members posted here. The board has
                        embarked on a mission to elevate the standards of
                        technical education, ensuring a holistic development
                        approach.
                      </p>
                      <p className="text-muted-foreground leading-relaxed mt-4">
                        Since its inception in 2002, the State Board of
                        Technical Education (SBTE) has emerged as a pivotal
                        board, driving the advancement of technical education
                        across the state. This report delineates the
                        comprehensive policies, noteworthy achievements, and
                        visionary goals that underscore the SBTE&apos;s
                        dedication to fostering a robust technical education
                        framework.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="achievements">
                  <Card>
                    <CardHeader>
                      <CardTitle>Key Achievements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-4">
                        {[
                          "First and Second-Ever Convocations in 2023 and 2024",
                          "Implementation of Uniform Grading System",
                          "Amended Curriculum aligned with NEP 20 and AICTE guidelines",
                          "Regular Awarding of Diploma Certificates",
                        ].map((achievement, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-3 text-muted-foreground"
                          >
                            <div className="h-2 w-2 rounded-full bg-primary" />
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="vision">
                  <Card>
                    <CardHeader>
                      <CardTitle>Vision for the Future</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-4">
                        {[
                          "Innovation and Technological advancement through Management Information System",
                          "Industry collaboration and workforce readiness",
                          "Accessibility and inclusivity for economically backward students",
                          "Promotion of Technical Institutes through various media channels",
                          "Regular Convocations to celebrate student achievements",
                        ].map((vision, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-3 text-muted-foreground"
                          >
                            <div className="h-2 w-2 rounded-full bg-primary" />
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
