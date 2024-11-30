"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  BookOpen,
  Users,
  Award,
  ChevronDown,
  GraduationCap,
  Building,
  FileText,
  Bell,
} from "lucide-react";
import Footer from "@/components/navbar/footer";

// Sample latest results data
const latestResults = [
  {
    title: "Diploma in Civil Engineering - Final Semester Results",
    date: "March 15, 2024",
    status: "Published",
  },
  {
    title: "Diploma in Mechanical Engineering - Mid Semester Results",
    date: "March 10, 2024",
    status: "Published",
  },
  {
    title: "Diploma in Electronics - Practical Examination Results",
    date: "March 5, 2024",
    status: "Published",
  },
];

// Expanded features list
const features = [
  {
    icon: BookOpen,
    title: "Course Management",
    description:
      "Comprehensive management of technical courses, curricula, and academic schedules across all affiliated institutions.",
  },
  {
    icon: Users,
    title: "Student Portal",
    description:
      "Centralized student information system with easy access to attendance, results, and course materials.",
  },
  {
    icon: Award,
    title: "Performance Analytics",
    description:
      "Advanced tracking and analysis of student performance metrics and institutional achievements.",
  },
  {
    icon: Building,
    title: "Institution Management",
    description:
      "Streamlined oversight of affiliated technical institutions and their compliance with standards.",
  },
  {
    icon: FileText,
    title: "Digital Documentation",
    description:
      "Paperless processing of certificates, marksheets, and other important academic documents.",
  },
  {
    icon: GraduationCap,
    title: "Faculty Development",
    description:
      "Continuous professional development programs and resources for teaching staff.",
  },
];

// Department information
const departments = [
  {
    title: "Civil Engineering",
    description: "Focusing on infrastructure development and structural design",
    studentCount: "2,500+",
    image: "/civil.jpg",
  },
  {
    title: "Mechanical Engineering",
    description: "Excellence in manufacturing and industrial automation",
    studentCount: "2,800+",
    image: "/mec.jpg",
  },
  {
    title: "Electronics Engineering",
    description: "Leading innovation in electronic systems and communication",
    studentCount: "2,300+",
    image: "/elec.jpg",
  },
];

const FeatureCard = ({ icon: Icon, title, description }: any) => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <Card className="h-full transition-all hover:shadow-lg hover:scale-105">
        <CardHeader>
          <CardTitle className="flex flex-col items-center space-y-4">
            <Icon className="h-12 w-12 text-primary" />
            <span className="text-xl font-semibold text-center">{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const NotificationBanner = () => (
  <div className="bg-primary/10 p-3 text-sm flex items-center justify-center space-x-2">
    <Bell className="h-4 w-4" />
    <span>
      New Results Announced: Diploma in Civil Engineering Final Semester
    </span>
    <Link href="/results" className="underline font-medium">
      View Now
    </Link>
  </div>
);

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NotificationBanner />

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <motion.div
          className="absolute inset-0 z-0 bg-gradient-to-b from-primary/5 to-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
        <div className="relative z-10 text-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold mb-6 leading-tight">
              State Board of Technical Education
              <span className="block text-2xl sm:text-3xl text-primary mt-4">
                Shaping Tomorrow&apos;s Technical Leaders
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Empowering students through quality technical education and
              innovative learning approaches. Join us in building a skilled
              workforce for the future.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button size="lg" className="w-full sm:w-auto">
                Student Portal <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Institution Login
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 md:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Comprehensive Technical Education Management
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our integrated platform provides everything needed for modern
              technical education administration
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Our Technical Departments
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.map((dept, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="group"
              >
                <div className="relative overflow-hidden rounded-lg">
                  <img
                    src={dept.image}
                    alt={dept.title}
                    className="w-full h-64 object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 p-6 text-white">
                    <h3 className="text-xl font-bold mb-2">{dept.title}</h3>
                    <p className="text-sm opacity-90 mb-2">
                      {dept.description}
                    </p>
                    <p className="text-sm font-semibold">
                      Current Students: {dept.studentCount}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Results Section */}
      <section className="py-20 px-4 md:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Latest Results
            </h2>
            <p className="text-muted-foreground">
              Stay updated with the most recent examination results and
              announcements
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestResults.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="cursor-pointer hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold mb-2">{result.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Published on {result.date}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                        {result.status}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button variant="outline" size="lg">
              View All Results
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 md:px-8 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl sm:text-4xl font-bold">
              Begin Your Technical Education Journey
            </h2>
            <p className="text-lg max-w-2xl mx-auto opacity-90">
              Join thousands of students already pursuing their dreams through
              our accredited technical education programs.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button size="lg" variant="secondary">
                Explore Programs
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent">
                Contact Us
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
