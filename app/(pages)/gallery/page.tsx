"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface GalleryItem {
  id: number;
  title: string;
  imageUrl: string;
  tags: string[];
}

// Sample gallery data
const galleryData: GalleryItem[] = [
  {
    id: 1,
    title: "CCCT Convocation",
    imageUrl: "/Convocation1/selected1.jpg",
    tags: ["ccct", "convocation", "2022-23"],
  },
  {
    id: 3,
    title: "CCCT Convocation",
    imageUrl: "/Convocation1/selected2.jpg",
    tags: ["ccct", "convocation", "2022-23"],
  },
  {
    id: 4,
    title: "CCCT Convocation",
    imageUrl: "/Convocation1/selected3.jpg",
    tags: ["ccct", "convocation", "2022-23"],
  },
  {
    id: 5,
    title: "CCCT Convocation",
    imageUrl: "/Convocation1/selected4.jpg",
    tags: ["ccct", "convocation", "2022-23"],
  },
  {
    id: 1,
    title: "CCCT Convocation",
    imageUrl: "/Convocation1/selected5.jpg",
    tags: ["ccct", "convocation", "2022-23"],
  },
  {
    id: 6,
    title: "CCCT Convocation",
    imageUrl: "/Convocation1/selected6.jpg",
    tags: ["ccct", "convocation", "2022-23"],
  },
  {
    id: 7,
    title: "CCCT Convocation",
    imageUrl: "/Convocation1/selected7.jpg",
    tags: ["ccct", "convocation", "2022-23"],
  },
  {
    id: 8,
    title: "ATTC Convocation",
    imageUrl: "/Convocation2/cn1.jpg",
    tags: ["attc", "convocation", "2019-22"],
  },
  {
    id: 9,
    title: "ATTC Convocation",
    imageUrl: "/Convocation2/cn2.jpg",
    tags: ["attc", "convocation", "2019-22"],
  },
  {
    id: 10,
    title: "ATTC Convocation",
    imageUrl: "/Convocation2/cn3.jpg",
    tags: ["attc", "convocation", "2019-22"],
  },
  {
    id: 11,
    title: "ATTC Convocation",
    imageUrl: "/Convocation2/cn4.jpg",
    tags: ["attc", "convocation", "2019-22"],
  },
  {
    id: 12,
    title: "ATTC Convocation",
    imageUrl: "/Convocation2/cn5.jpg",
    tags: ["attc", "convocation", "2019-22"],
  },
  {
    id: 13,
    title: "ATTC Convocation",
    imageUrl: "/Convocation2/cn6.jpg",
    tags: ["attc", "convocation", "2019-22"],
  },
  {
    id: 14,
    title: "ATTC Convocation",
    imageUrl: "/Convocation2/cn7.jpg",
    tags: ["attc", "convocation", "2019-22"],
  },
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
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer"
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
