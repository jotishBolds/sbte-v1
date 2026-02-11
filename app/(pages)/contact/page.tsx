"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Building } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(data);
      setSubmitSuccess(true);
      form.reset();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">

      {/* Gradient Heading */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
          Contact Us
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Get in touch with us for any inquiries or support
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* ================= FORM ================= */}
        <Card className="shadow-xl border-0 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500" />

          <CardHeader>
            <CardTitle className="text-green-700">
              Send us a Message
            </CardTitle>
            <CardDescription>
              Fill out the form and we&apos;ll get back to you soon.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-600">Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="focus:ring-2 focus:ring-green-500" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-600">Email</FormLabel>
                      <FormControl>
                        <Input {...field} className="focus:ring-2 focus:ring-green-500" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-600">Subject</FormLabel>
                      <FormControl>
                        <Input {...field} className="focus:ring-2 focus:ring-green-500" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-600">Message</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="min-h-[150px] resize-none focus:ring-2 focus:ring-green-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {submitSuccess && (
                  <Alert className="bg-green-100 border-green-500">
                    <AlertDescription className="text-green-700 font-medium">
                      Thank you! Your message has been sent successfully.
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:opacity-90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* ================= CONTACT INFO ================= */}
        <div className="space-y-8">

          <Card className="shadow-xl border-0 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500" />

            <CardHeader>
              <CardTitle className="text-blue-700">
                Contact Information
              </CardTitle>
              <CardDescription>
                Find us using the details below
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">

              <div className="flex items-start space-x-4">
                <Building className="w-5 h-5 text-purple-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-800">
                    State Board of Technical Education
                  </h3>
                  <p className="text-gray-600">
                    Education Department, Government of Sikkim
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <MapPin className="w-5 h-5 text-green-600" />
                <p className="text-gray-600">Gangtok, Sikkim - 737101</p>
              </div>

              <div className="flex items-center space-x-4">
                <Phone className="w-5 h-5 text-blue-600" />
                <p className="text-gray-600">
                  Contact: Education Department, Government of Sikkim
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <Mail className="w-5 h-5 text-red-500" />
                <a
                  href="mailto:sbte.sikkim@gmail.com"
                  className="text-blue-600 hover:underline"
                >
                  sbte.sikkim@gmail.com
                </a>
              </div>

            </CardContent>
          </Card>

          {/* Map */}
          <Card className="shadow-xl border-0 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500" />

            <CardHeader>
              <CardTitle className="text-purple-700">
                Location
              </CardTitle>
              <CardDescription>Find us on the map</CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              <div className="aspect-video w-full overflow-hidden rounded-b-lg">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14211.144367353574!2d88.59340985!3d27.3314425!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39e6a56a5805eafb%3A0x73d6132c501c8f20!2sGangtok%2C%20Sikkim%20737101!5e0!3m2!1sen!2sin!4v1703161545789!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  title="SBTE Location"
                />
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;
