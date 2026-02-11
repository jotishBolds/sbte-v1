"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileDown, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NotificationItem {
  id: string;
  title: string;
  date: string;
  description: string;
  pdfUrl: string;
}

const notifications: NotificationItem[] = [
  {
    id: "3",
    title: "Revised Curriculum Implementation",
    date: "10 Dec 2024",
    description:
      "Notice regarding the implementation of revised curriculum as per NEP 20 and AICTE guidelines.",
    pdfUrl: "/notification-pdf/Notification3.pdf",
  },
  {
    id: "4",
    title: "Industry Internship Program",
    date: "05 Dec 2024",
    description:
      "Guidelines for mandatory internship program during semester break for all diploma students.",
    pdfUrl: "/notification-pdf/Notification4.pdf",
  },
  {
    id: "5",
    title: "SBTE Gazette",
    date: "01 Dec 2024",
    description:
      "Information about scholarship opportunities for economically backward students in technical courses.",
    pdfUrl: "/notification-pdf/Notification5.pdf",
  },
];

const NotificationsCirculation = () => {
  const handleDownload = async (pdfUrl: string, title: string) => {
    try {
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error("PDF download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      const filename = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`;
      link.setAttribute("download", filename);

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to download PDF. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-10 bg-gray-50">
      <div className="max-w-6xl mx-auto">

        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Circulars & Notifications
          </h1>

          <div className="flex items-center justify-center gap-2 mt-4 text-gray-600">
            <Bell className="w-5 h-5 text-purple-600" />
            <p className="font-medium">
              Stay updated with the latest announcements from SBTE
            </p>
          </div>
        </div>

        {/* Notifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {notifications.map((notification, index) => (
            <Card
              key={notification.id}
              className="flex flex-col shadow-lg hover:shadow-2xl transition-all duration-300 border-0 overflow-hidden"
            >
              {/* Accent Top Border */}
              <div className="h-2 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500" />

              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-800 line-clamp-2">
                  {notification.title}
                </CardTitle>

                <Badge className="mt-2 w-fit bg-blue-600 text-white text-xs">
                  {notification.date}
                </Badge>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {notification.description}
                </p>
              </CardContent>

              <CardFooter className="mt-auto p-4">
                <Button
                  className="w-full flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:opacity-90 transition"
                  onClick={() =>
                    handleDownload(notification.pdfUrl, notification.title)
                  }
                >
                  <FileDown className="w-4 h-4" />
                  Download PDF
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationsCirculation;
