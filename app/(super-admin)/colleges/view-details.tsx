"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Globe,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CreditCard,
  User,
  Hash,
  QrCode,
} from "lucide-react";
import { College } from "@/types/collage";
import { Badge } from "@/components/ui/badge";
import { S3Logo } from "@/components/ui/s3-image";

interface CollegeViewModalProps {
  college: College | null;
  isOpen: boolean;
  onClose: () => void;
}

const CollegeViewModal: React.FC<CollegeViewModalProps> = ({
  college,
  isOpen,
  onClose,
}) => {
  if (!college) return null;

  const renderInfoItem = (
    icon: React.ReactNode,
    label: string | React.ReactNode
  ) => (
    <div className="flex items-center space-x-3 py-2 border-b last:border-b-0">
      {icon}
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            {college.name}
          </DialogTitle>
          <DialogDescription>
            Detailed information about the institution
          </DialogDescription>
        </DialogHeader>

        {/* College Logo with secure loading */}
        <div className="flex justify-center mb-4">
          <S3Logo
            s3Url={college.logo}
            alt={`${college.name} logo`}
            className="h-32 w-32 rounded-lg shadow-md"
          />
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General Info</TabsTrigger>
            <TabsTrigger value="financial">Financial Details</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardContent className="space-y-4 pt-4">
                {renderInfoItem(
                  <MapPin className="h-5 w-5 text-muted-foreground" />,
                  college.address
                )}

                {renderInfoItem(
                  <Calendar className="h-5 w-5 text-muted-foreground" />,
                  `Established on ${new Date(
                    college.establishedOn
                  ).toLocaleDateString()}`
                )}

                {college.websiteUrl &&
                  renderInfoItem(
                    <Globe className="h-5 w-5 text-muted-foreground" />,
                    <a
                      href={college.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Visit Website
                    </a>
                  )}

                {college.contactEmail &&
                  renderInfoItem(
                    <Mail className="h-5 w-5 text-muted-foreground" />,
                    college.contactEmail
                  )}

                {college.contactPhone &&
                  renderInfoItem(
                    <Phone className="h-5 w-5 text-muted-foreground" />,
                    college.contactPhone
                  )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial">
            <Card>
              <CardContent className="space-y-4 pt-4">
                {college.IFSCCode &&
                  renderInfoItem(
                    <Hash className="h-5 w-5 text-muted-foreground" />,
                    <Badge variant="secondary">IFSC: {college.IFSCCode}</Badge>
                  )}

                {college.AccountNo &&
                  renderInfoItem(
                    <CreditCard className="h-5 w-5 text-muted-foreground" />,
                    `Account No: ${college.AccountNo}`
                  )}

                {college.AccountHolderName &&
                  renderInfoItem(
                    <User className="h-5 w-5 text-muted-foreground" />,
                    `Account Holder: ${college.AccountHolderName}`
                  )}

                {college.UPIID &&
                  renderInfoItem(
                    <QrCode className="h-5 w-5 text-muted-foreground" />,
                    <Badge variant="outline">UPI ID: {college.UPIID}</Badge>
                  )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CollegeViewModal;
