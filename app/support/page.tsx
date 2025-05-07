"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mail, Phone, MapPin, Clock, Calendar } from "lucide-react";
import Footer from "@/components/navbar/footer";

const SupportPage = () => {
  const faqs = [
    {
      question: "How do I apply for admission to a technical institute?",
      answer:
        "Admission to technical institutes under SBTE typically opens after Class X results. Applications can be submitted online through our portal or physically at designated centers. Keep checking our website for admission announcements.",
    },
    {
      question: "What documents are required for diploma course registration?",
      answer:
        "You'll need to submit your Class X mark sheet, domicile certificate, category certificate (if applicable), ID proof, passport-sized photographs, and completed application form. Additional documents may be required based on specific program requirements.",
    },
    {
      question: "How can I obtain my diploma certificate?",
      answer:
        "Diploma certificates are distributed during the convocation ceremony. If you missed the convocation, you can apply for your certificate through your institute's administrative office with proper identification and documentation.",
    },
    {
      question: "What is the fee structure for diploma courses?",
      answer:
        "Fee structures vary by program and are revised periodically. Current fee details are available on our website under the Admissions section or can be obtained directly from the respective institutes.",
    },
    {
      question: "Are there any scholarships available for technical education?",
      answer:
        "Yes, various scholarships are available for eligible students including merit-based scholarships and those for students from economically weaker backgrounds. Please visit the Scholarships section on our website for detailed information.",
    },
  ];

  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email Us",
      value: "sbte.sikkim@gmail.com",
      action: "mailto:sbte.sikkim@gmail.com",
      actionText: "Send Email",
      description: "For general inquiries and document submissions",
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Call Us",
      value: "+91 9733123923",
      action: "tel:+919733123923",
      actionText: "Call Now",
      description:
        "For urgent concerns, please contact us directly for prompt assistance.",
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Visit Us",
      value: "Education Department, Tashiling Secretariat, Gangtok, Sikkim",
      action:
        "https://maps.google.com/?q=Education+Department+Tashiling+Secretariat+Gangtok+Sikkim",
      actionText: "View Map",
      description: "Locate Us",
    },
  ];

  return (
    <ScrollArea className="h-screen">
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-12 md:py-16 bg-primary/10">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Support & Contact
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto px-4">
              We&apos;re here to help with any questions or concerns about
              Sikkim&apos;s technical education. Reach out to our team for
              assistance with admissions, certifications, or general inquiries.
            </p>
          </div>
        </section>

        {/* Contact Cards Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-primary">
                Get In Touch
              </h2>
              <p className="mt-2 text-muted-foreground">
                Multiple ways to reach the State Board of Technical Education
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
              {contactInfo.map((contact, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-full"
                >
                  <Card className="h-full">
                    <CardHeader className="text-center pb-2">
                      <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4">
                        {contact.icon}
                      </div>
                      <CardTitle className="text-xl">{contact.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="font-medium break-words">{contact.value}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {contact.description}
                      </p>
                    </CardContent>
                    <CardFooter className="justify-center pt-0 pb-6">
                      <Button asChild>
                        <a
                          href={contact.action}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {contact.actionText}
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-primary">
                Frequently Asked Questions
              </h2>
              <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                Find answers to commonly asked questions about technical
                education in Sikkim
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Support Hours Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-primary">
                  Office Hours
                </h2>
                <p className="mt-2 text-muted-foreground">
                  When you can reach our support team
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <CardTitle>Weekdays</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="text-center pb-6">
                    <p className="text-muted-foreground">Monday - Friday</p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <p className="font-medium text-lg">10:00 AM - 4:30 PM</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <CardTitle>Weekends</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="text-center pb-6">
                    <div>
                      <p className="text-muted-foreground">Saturday</p>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <Clock className="h-4 w-4 text-primary" />
                        <p className="font-medium text-lg">
                          10:00 AM - 1:00 PM
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-muted-foreground">Sunday</p>
                      <p className="font-medium text-lg">Closed</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-primary/5 p-4 md:p-6 rounded-lg text-center">
                <p className="text-muted-foreground">
                  For urgent matters outside office hours, please email us at{" "}
                  <a
                    href="mailto:sbte.sikkim@gmail.com"
                    className="text-primary font-medium hover:underline"
                  >
                    sbte.sikkim@gmail.com
                  </a>{" "}
                  and we&apos;ll respond as soon as possible on the next working
                  day.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Direct Contact CTA */}
        <section className="py-12 md:py-16 bg-primary/10">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
              Need Immediate Assistance?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Our support team is ready to help you with any questions or
              concerns. Don&apos;t hesitate to reach out via phone or email.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="tel:+919733123923">
                  <Phone className="h-5 w-5 mr-2" />
                  Call: +91 9733123923
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="mailto:sbte.sikkim@gmail.com">
                  <Mail className="h-5 w-5 mr-2" />
                  Email: sbte.sikkim@gmail.com
                </a>
              </Button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </ScrollArea>
  );
};

export default SupportPage;
