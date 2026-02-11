"use client";
import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface GalleryItem {
  id: number;
  title: string;
  imageUrl: string;
  tags: string[];
}

const galleryData: GalleryItem[] = [
  {
    id: 1,
    title: "SBTE Convocation",
    imageUrl: "/Convocation1/selected1.jpg",
    tags: ["Manan Kendra", "Convocation", "2022-2023"],
  },
  {
    id: 2,
    title: "SBTE Convocation",
    imageUrl: "/Convocation1/selected2.jpg",
    tags: ["Manan Kendra", "Convocation", "2022-2023"],
  },
  {
    id: 3,
    title: "SBTE Convocation",
    imageUrl: "/Convocation1/selected3.jpg",
    tags: ["Manan Kendra", "Convocation", "2022-2023"],
  },
  {
    id: 4,
    title: "SBTE Convocation",
    imageUrl: "/Convocation1/selected4.jpg",
    tags: ["Manan Kendra", "Convocation", "2022-2023"],
  },
  {
    id: 5,
    title: "SBTE Convocation",
    imageUrl: "/Convocation1/selected5.jpg",
    tags: ["Manan Kendra", "Convocation", "2022-2023"],
  },
  {
    id: 6,
    title: "SBTE Convocation",
    imageUrl: "/Convocation1/selected6.jpg",
    tags: ["Manan Kendra", "Convocation", "2022-2023"],
  },
  {
    id: 8,
    title: "SBTE Convocation",
    imageUrl: "/Convocation2/cn1.jpg",
    tags: ["CCCT", "Convocation", "2023-2024"],
  },
  {
    id: 9,
    title: "SBTE Convocation",
    imageUrl: "/Convocation2/cn2.jpg",
    tags: ["CCCT", "Convocation", "2023-2024"],
  },
  {
    id: 10,
    title: "SBTE Convocation",
    imageUrl: "/Convocation2/cn3.jpg",
    tags: ["CCCT", "Convocation", "2023-2024"],
  },
  {
    id: 11,
    title: "SBTE Convocation",
    imageUrl: "/Convocation1/cn4.jpg",
    tags: ["CCCT", "Convocation", "2022-2023"],
  },
  {
    id: 12,
    title: "SBTE Convocation",
    imageUrl: "/Convocation1/cn5.jpg",
    tags: ["CCCT", "Convocation", "2022-2023"],
  },
  {
    id: 13,
    title: "SBTE Convocation",
    imageUrl: "/Convocation1/cn6.jpg",
    tags: ["CCCT", "Convocation", "2022-2023"],
  },
    {
    id: 14,
    title: "SBTE Convocation",
    imageUrl: "/Convocation3/convo1.jpg",
    tags: ["ATTC", "Convocation", "2024-2025"],
  },
  {
    id: 15,
    title: "SBTE Convocation",
    imageUrl: "/Convocation3/convo2.jpg",
    tags: ["ATTC", "Convocation", "2024-2025"],
  },
  {
    id: 16,
    title: "SBTE Convocation",
    imageUrl: "/Convocation3/convo3.jpg",
    tags: ["ATTC", "Convocation", "2024-2025"],
  }
];

// Get unique tags from gallery data and sort them
const allTags = Array.from(
  new Set(galleryData.flatMap((item) => item.tags))
).sort();

export default function GalleryPage() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Improved filtering logic
  const filteredItems = selectedTag
    ? galleryData.filter((item) =>
        item.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase())
      )
    : galleryData;

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Tags ScrollArea */}
      <ScrollArea className="w-full whitespace-nowrap mb-8">
        <div className="flex space-x-2 pb-4">
          <Badge
            variant={selectedTag === null ? "default" : "secondary"}
            className="cursor-pointer hover:bg-secondary/80"
            onClick={() => setSelectedTag(null)}
          >
            All
          </Badge>
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={
                selectedTag?.toLowerCase() === tag.toLowerCase()
                  ? "default"
                  : "secondary"
              }
              className="cursor-pointer hover:bg-secondary/80"
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <Card key={`${item.id}-${item.imageUrl}`} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-video">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width:
                  1024px) 50vw, 33vw"
                  className="object-cover"
                  priority={item.id <= 12} // Prioritize loading the first 6 images
                />
              </div>
              <div className="p-4">
              <Badge className="mb-2 px-2 py-0.5 text-xs font-medium bg-green-600 text-white hover:bg-green-700">
                {item.title}
              </Badge>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag, index) => (
                  <Badge
                    key={tag}
                    className={`cursor-pointer text-white border-0 px-2 py-0.5 text-xs font-medium transition-all duration-200 ${
                      [
                        "bg-blue-600 hover:bg-blue-700",
                        "bg-purple-600 hover:bg-purple-700",
                        "bg-pink-600 hover:bg-pink-700",
                        "bg-orange-600 hover:bg-orange-700",
                        "bg-teal-600 hover:bg-teal-700",
                        "bg-red-600 hover:bg-red-700",
                      ][index % 6]
                    }`}
                    onClick={() => setSelectedTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No items found for the selected tag.
          </p>
        </div>
      )}
    </div>
  );
}
