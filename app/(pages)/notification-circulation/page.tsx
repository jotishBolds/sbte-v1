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

interface NotificationItem {
  id: string;
  title: string;
  date: string;
  description: string;
  pdfUrl: string;
}

const notifications: NotificationItem[] = [
  {
    id: "1",
    title: "SBTE Notice",
    date: "20 Dec 2024",
    description:
      "Important notification regarding the upcoming semester examination schedule for ATTC & CCCT polytechnic students.",
    pdfUrl: "/notification-pdf/Notification.pdf",
  },
  {
    id: "2",
    title: "Annual Convocation Ceremony Notice",
    date: "15 Dec 2024",
    description:
      "Details about the upcoming convocation ceremony for diploma students from ATTC and CCCT polytechnics.",
    pdfUrl: "/notification-pdf/Notification2.pdf",
  },
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
      // Fetch the PDF file
      const response = await fetch(pdfUrl);

      if (!response.ok) {
        throw new Error("PDF download failed");
      }

      // Convert the response to a blob
      const blob = await response.blob();

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element
      const link = document.createElement("a");
      link.href = url;

      // Set the download filename to the notification title (sanitized)
      const filename = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`;
      link.setAttribute("download", filename);

      // Append to document, click, and cleanup
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to download PDF. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Circulars & Notifications
          </h1>
          <div className="flex items-center justify-center gap-2 mb-6">
            <Bell className="w-5 h-5" />
            <p>Stay updated with the latest announcements from SBTE</p>
          </div>
        </div>

        {/* Notifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notifications.map((notification) => (
            <Card key={notification.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg font-semibold line-clamp-2">
                  {notification.title}
                </CardTitle>
                <p className="text-sm">{notification.date}</p>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3">{notification.description}</p>
              </CardContent>
              <CardFooter className="mt-auto">
                <Button
                  className="w-full flex items-center gap-2"
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
