import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GraduationCap, Calendar, MapPin, Play } from "lucide-react";

interface ConvocationData {
  year: string;
  date: string;
  venue: string;
  chiefGuest: string;
  description: string;
  highlights: string[];
  imageUrls: string[];
  videoUrl: string;
}

const convocationData: ConvocationData[] = [
  {
    year: "2022-23",
    date: "27th February 2024",
    venue: "CCCT Campus, Chisopani, South Sikkim",
    chiefGuest:
      "Shri R. Telang, IAS, Additional Chief Secretary, Education Department",
    description:
      "The Second Convocation of the Advanced Technical Training Centre (ATTC) and Centre for Computers & Communication Technology (CCCT) marked a significant milestone for the 2022-2023 batch graduates.",
    highlights: [
      "Project Display showcasing innovative student projects",
      "Address by ATTC Principal on post-flood recovery",
      "Recognition of student achievements through diploma distribution",
      "Emphasis on innovation and lifelong learning",
    ],
    imageUrls: [
      "/Convocation1/selected1.jpg",
      "/Convocation1/selected2.jpg",
      "/Convocation1/selected3.jpg",
      "/Convocation1/selected4.jpg",
      "/Convocation1/selected5.jpg",
      "/Convocation1/selected6.jpg",
    ],
    videoUrl: "https://youtu.be/r7SVZADUArc",
  },
  {
    year: "2019-22",
    date: "29th March 2023",
    venue: "Manan Kendra, Gangtok",
    chiefGuest: "P.S. Golay, Chief Minister of Sikkim",
    description:
      "The first-ever Convocation organized by the State Board of Technical Education (SBTE) celebrated the achievements of 403 students from ATTC and CCCT.",
    highlights: [
      "403 students awarded diploma certificates",
      "20 medals awarded for academic excellence",
      "Focus on becoming job providers",
      "Government commitment to education development",
    ],
    imageUrls: [
      "/Convocation1/cn1.jpg",
      "/Convocation1/cn2.jpg",
      "/Convocation1/cn3.jpg",
      "/Convocation1/cn4.jpg",
      "/Convocation1/cn5.jpg",
      "/Convocation1/cn6.jpg",
    ],
    videoUrl: "https://www.youtube.com/watch?v=L1pHS6ra3JQ",
  },
];

const ConvocationPage = () => {
  const getVideoId = (url: string) => {
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };

  return (
    <div className="min-h-screen ">
      {/* Hero Section */}
      <div>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl ">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              ATTC & CCCT Convocation Ceremonies
            </h1>
            <p className="text-xl md:text-2xl  mb-8">
              Celebrating Excellence in Technical Education
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-6 h-6" />
                <span>400+ Graduates</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-6 h-6" />
                <span>Annual Ceremony</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-6 h-6" />
                <span>Sikkim, India</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className=" py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-3xl font-bold ">2</h3>
                  <p className="">Successful Convocations</p>
                </div>
              </CardContent>
            </Card>
            <Card className="">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-3xl font-bold ">20+</h3>
                  <p className="">Excellence Awards</p>
                </div>
              </CardContent>
            </Card>
            <Card className="">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-3xl font-bold ">2</h3>
                  <p className="">Premier Institutions</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="convocations" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="convocations">Convocation Details</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
          </TabsList>

          <TabsContent value="convocations">
            <div className="grid gap-6 md:grid-cols-2">
              {convocationData.map((convocation, index) => (
                <Card key={index} className="w-full">
                  <CardHeader>
                    <CardTitle className="text-2xl">
                      {convocation.year} Convocation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold">Date:</h3>
                          <p>{convocation.date}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Venue:</h3>
                          <p>{convocation.venue}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Chief Guest:</h3>
                          <p>{convocation.chiefGuest}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Description:</h3>
                          <p>{convocation.description}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Key Highlights:</h3>
                          <ul className="list-disc pl-6">
                            {convocation.highlights.map((highlight, idx) => (
                              <li key={idx}>{highlight}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="gallery">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {convocationData.map((convocation) => (
                <React.Fragment key={convocation.year}>
                  {convocation.imageUrls.map((url, idx) => (
                    <Card key={idx} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="relative aspect-video">
                          <img
                            src={url}
                            alt={`Convocation ${convocation.year} image ${
                              idx + 1
                            }`}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="p-4">
                          <p className="text-sm text-gray-500">
                            {convocation.year} Convocation
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="videos">
            <div className="grid gap-6 md:grid-cols-2">
              {convocationData.map((convocation, index) => (
                <Card key={index} className="w-full">
                  <CardHeader>
                    <CardTitle className="text-xl">
                      {convocation.year} Convocation Ceremony
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-100">
                      <iframe
                        src={`https://www.youtube.com/embed/${getVideoId(
                          convocation.videoUrl
                        )}`}
                        title={`${convocation.year} Convocation Video`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>
                    <div className="mt-4 text-sm ">
                      <p>Venue: {convocation.venue}</p>
                      <p>Date: {convocation.date}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ConvocationPage;
