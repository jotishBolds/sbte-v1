"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useAnimation, Variants } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookOpen, Users, Award, ChevronDown } from "lucide-react";
import Footer from "@/components/navbar/footer";

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: BookOpen,
    title: "Course Management",
    description: "Easily manage courses, schedules, and curricula.",
  },
  {
    icon: Users,
    title: "Student Information",
    description: "Maintain comprehensive student records and profiles.",
  },
  {
    icon: Award,
    title: "Performance Tracking",
    description: "Monitor and analyze student and faculty performance.",
  },
];

const FeatureCard: React.FC<Feature> = ({ icon: Icon, title, description }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const variants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      transition={{ duration: 0.5 }}
    >
      <Card className="h-full transition-shadow hover:shadow-lg bg-white text-black border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-center">
            <Icon className="h-12 w-12 text-gray-800 mb-4" />
          </CardTitle>
          <CardTitle className="text-xl font-semibold text-center text-gray-900">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function HomePage(): JSX.Element {
  const [scrollY, setScrollY] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <main className="flex-grow">
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
          <motion.div
            className="absolute inset-0 z-0 bg-gradient-to-b from-gray-100 to-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />
          <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h1
              className="text-5xl md:text-7xl font-extrabold mb-6 text-black leading-tight"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Welcome to the <span className="text-gray-800">SBTE</span>
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-gray-600 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Streamline your college administration with our comprehensive
              management solution.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link href="/login" passHref>
                <Button
                  size="lg"
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about" passHref>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent text-black border-black hover:bg-gray-100"
                >
                  Learn More
                </Button>
              </Link>
            </motion.div>
          </div>
          <motion.div
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.6,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <ChevronDown className="h-10 w-10 text-gray-600" />
          </motion.div>
        </section>

        <section className="py-20 px-4 md:px-8 bg-gray-100">
          <div className="max-w-7xl mx-auto">
            <motion.h2
              className="text-4xl font-bold text-center mb-12 text-gray-900"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Key Features
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
