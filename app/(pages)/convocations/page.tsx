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
    year: "First",
    date: "29th March 2023",
    venue: "Manan Kendra, Gangtok",
    chiefGuest: "Shri P.S. Golay, Chief Minister of Sikkim",
    description:
      "The first-ever Convocation organized by the State Board of Technical Education (SBTE) celebrated the achievements of 403 students from ATTC and CCCT.",
    highlights: [
      "403 students awarded diploma certificates",
      "20 medals awarded for academic excellence",
      "Focus on becoming job providers",
      "Government commitment to education development",
    ],
    imageUrls: [
      "/Convocation1/selected1.jpg",
      "/Convocation1/selected2.jpg",
      "/Convocation1/selected3.jpg",
      "/Convocation1/selected4.jpg",
      "/Convocation1/selected5.jpg",
      "/Convocation1/selected6.jpg",
    ],
    videoUrl: "https://www.youtube.com/watch?v=L1pHS6ra3JQ",
  },
  {
    year: "Second",
    date: "27th February 2024",
    venue: "CCCT Campus, Chisopani, South Sikkim",
    chiefGuest:
      "Shri R. Telang, IAS,Chief Secretary,Government of Sikkim",
    description:
      "The Second Convocation of the Advanced Technical Training Centre (ATTC) and Centre for Computers & Communication Technology (CCCT) marked a significant milestone for the 2022-2023 batch graduates.",
    highlights: [
      "Project Display showcasing innovative student projects",
      "Address by ATTC Principal on post-flood recovery",
      "Recognition of student achievements through diploma distribution",
      "Emphasis on innovation and lifelong learning",
    ],
     imageUrls: [
      "/Convocation1/cn1.jpg",
      "/Convocation1/cn2.jpg",
      "/Convocation1/cn3.jpg",
      "/Convocation1/cn4.jpg",
      "/Convocation1/cn5.jpg",
      "/Convocation1/cn6.jpg",
    ],
    videoUrl: "https://youtu.be/r7SVZADUArc",
  },
  {
    year: "Third",
    date: "27th Feb 2025",
    venue: "ATTC, Bardang, Pakyong District",
    chiefGuest: "Shri Raju Basnet, Minister, Education Department, Government of Sikkim",
    description:
      "The third Convocation organized by the State Board of Technical Education (SBTE) celebrated the achievements of 403+ students from ATTC and CCCT.",
    highlights: [
      "403+ students awarded diploma certificates",
      "20 medals awarded for academic excellence",
      "Focus on becoming job providers",
      "Government commitment to education development",
    ],
    imageUrls: [
      "/Convocation3/convo1.jpg",
      "/Convocation3/convo2.jpg",
      "/Convocation3/convo3.jpg",
      "/Convocation3/convo4.jpg",
      "/Convocation3/convo5.jpg",
      "/Convocation3/convo6.jpg",
      "/Convocation3/convo7.jpg",
      "/Convocation3/convo8.jpg",
      "/Convocation3/convo9.jpg",
    ],
    videoUrl: "",
  }
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
        <div className="max-w-3xl">

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            ATTC & CCCT Convocation Ceremonies
          </h1>

          <p className="text-xl md:text-2xl mb-8">
            Celebrating Excellence in Technical Education
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Card 1 */}
            <div className="flex items-center space-x-3 bg-green-100 px-4 py-3 rounded-lg shadow-sm">
              <GraduationCap className="w-6 h-6 text-green-700" />
              <span className="text-green-800 font-medium text-sm">
                1200+ Certified Graduates
              </span>
            </div>

            {/* Card 2 */}
            <div className="flex items-center space-x-3 bg-blue-100 px-4 py-3 rounded-lg shadow-sm">
              <Calendar className="w-6 h-6 text-blue-700" />
              <span className="text-blue-800 font-medium text-sm">
                Annual Ceremony
              </span>
            </div>

            {/* Card 3 */}
            <div className="flex items-center space-x-3 bg-purple-100 px-4 py-3 rounded-lg shadow-sm">
              <MapPin className="w-6 h-6 text-purple-700" />
              <span className="text-purple-800 font-medium text-sm">
                Sikkim, India
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>


      {/* Stats Section */}
     <div className="py-6 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Card 1 */}
          <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardContent className="p-4">
              <div className="text-center">
                <h3 className="text-2xl font-bold">3</h3>
                <p className="mt-1 text-xs uppercase tracking-wide">
                  Successful Convocations
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 2 */}
          <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <CardContent className="p-4">
              <div className="text-center">
                <h3 className="text-2xl font-bold">60</h3>
                <p className="mt-1 text-xs uppercase tracking-wide">
                  Excellence Awards
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 3 */}
          <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <CardContent className="p-4">
              <div className="text-center">
                <h3 className="text-2xl font-bold">2</h3>
                <p className="mt-1 text-xs uppercase tracking-wide">
                  Premier Institutions
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>



      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="convocations" className="w-full">

        {/* 🌈 Tabs List */}
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-lg p-1">
          <TabsTrigger 
            value="convocations"
            className="data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-md"
          >
            Convocation Details
          </TabsTrigger>

          <TabsTrigger 
            value="gallery"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
          >
            Gallery
          </TabsTrigger>

          <TabsTrigger 
            value="videos"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md"
          >
            Videos
          </TabsTrigger>
        </TabsList>

        {/* ================= DETAILS TAB ================= */}
        <TabsContent value="convocations">
          <div className="grid gap-6 md:grid-cols-3 mt-6">
            {convocationData.map((convocation, index) => (
              <Card key={index} className="shadow-md hover:shadow-lg transition-all border-t-4 border-green-500">
                
                <CardHeader className="bg-green-50">
                  <CardTitle className="text-xl text-green-700">
                    {convocation.year} Convocation
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                    <div className="space-y-4 text-sm">

                      <div>
                        <h3 className="font-semibold text-green-600">Date:</h3>
                        <p>{convocation.date}</p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-blue-600">Venue:</h3>
                        <p>{convocation.venue}</p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-purple-600">Chief Guest:</h3>
                        <p>{convocation.chiefGuest}</p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-orange-600">Description:</h3>
                        <p>{convocation.description}</p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-pink-600">Key Highlights:</h3>
                        <ul className="list-disc pl-6 space-y-1">
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

        {/* ================= GALLERY TAB ================= */}
        <TabsContent value="gallery">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
            {convocationData.map((convocation) => (
              <React.Fragment key={convocation.year}>
                {convocation.imageUrls.map((url, idx) => (
                  <Card 
                    key={idx} 
                    className="overflow-hidden shadow-md hover:shadow-xl transition-all"
                  >
                    <CardContent className="p-0">
                      <div className="relative aspect-video">
                        <img
                          src={url}
                          alt="Convocation"
                          className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <div className="p-4">
                        <span className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded-full">
                          {convocation.year}{" "}Convocation
                        </span>
                      </div>

                    </CardContent>
                  </Card>
                ))}
              </React.Fragment>
            ))}
          </div>
        </TabsContent>

        {/* ================= VIDEOS TAB ================= */}
        <TabsContent value="videos">
          <div className="grid gap-6 md:grid-cols-3 mt-6">
            {convocationData.map((convocation, index) => (
              <Card 
                key={index} 
                className="shadow-md hover:shadow-lg transition-all border-t-4 border-purple-500"
              >
                <CardHeader className="bg-purple-50">
                  <CardTitle className="text-purple-700">
                    {convocation.year} Convocation Ceremony
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-100">
                    <iframe
                      src={`https://www.youtube.com/embed/${getVideoId(
                        convocation.videoUrl
                      )}`}
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>

                  <div className="mt-4 text-sm space-y-1">
                    <p className="text-blue-600 font-medium">
                      Venue: {convocation.venue}
                    </p>
                    <p className="text-green-600 font-medium">
                      Date: {convocation.date}
                    </p>
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
