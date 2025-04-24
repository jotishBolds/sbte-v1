import React from "react";
import { Link } from "@inertiajs/react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { ArrowRight, Calendar, Clock, UserRound, Tag } from "lucide-react";
import InfocusLayout from "@/Components/Layouts/InfocusLayout";

interface BlogPost {
    id: number;
    title: string;
    image: string;
    excerpt: string;
    link: string;
    date: string;
    readTime: string;
    author: string;
    category: string;
    isFeatured?: boolean;
}

const RecentBlogs: React.FC = () => {
    const featuredPost: BlogPost = {
        id: 1,
        title: "Transform Your Space: The Ultimate Guide to Canvas Arrangements",
        image: "/assets/placeholder.jpg",
        excerpt:
            "Discover the art of strategic canvas placement to create stunning visual narratives in any room. Learn professional techniques for balancing color, proportion, and theme.",
        link: "/blog/transform-your-space",
        date: "April 2, 2025",
        readTime: "8 min read",
        author: "Emma Richardson",
        category: "Interior Design",
        isFeatured: true,
    };

    const recentPosts: BlogPost[] = [
        {
            id: 2,
            title: "From Photo to Masterpiece: Selecting Images for Canvas Printing",
            image: "/assets/placeholder.jpg",
            excerpt:
                "Learn how to choose photographs that will translate beautifully to canvas, including resolution requirements, composition tips, and color considerations.",
            link: "/blog/photo-to-masterpiece",
            date: "March 28, 2025",
            readTime: "6 min read",
            author: "James Wilson",
            category: "Photography Tips",
        },
        {
            id: 3,
            title: "Art Conservation: Maintaining Your Canvas Prints for Decades",
            image: "/assets/placeholder.jpg",
            excerpt:
                "Expert advice on preserving your canvas prints, including proper cleaning techniques, ideal environmental conditions, and protection against UV damage.",
            link: "/blog/art-conservation",
            date: "March 23, 2025",
            readTime: "5 min read",
            author: "Sophia Chen",
            category: "Care & Maintenance",
        },
        {
            id: 4,
            title: "Gallery Walls: Creating Cohesive Multi-Canvas Displays",
            image: "/assets/placeholder.jpg",
            excerpt:
                "Step-by-step guidance for designing balanced gallery walls that tell your story through carefully arranged canvas collections.",
            link: "/blog/gallery-walls",
            date: "March 19, 2025",
            readTime: "7 min read",
            author: "Marcus Johnson",
            category: "Design Ideas",
        },
        {
            id: 5,
            title: "The Psychology of Color: Choosing Canvas Art for Different Rooms",
            image: "/assets/placeholder.jpg",
            excerpt:
                "Understanding how color psychology can guide your canvas selections to create the perfect atmosphere in every space of your home.",
            link: "/blog/psychology-of-color",
            date: "March 12, 2025",
            readTime: "9 min read",
            author: "Dr. Olivia Parker",
            category: "Color Theory",
        },
        {
            id: 6,
            title: "Sustainable Art: Our Eco-Friendly Canvas Production Process",
            image: "/assets/placeholder.jpg",
            excerpt:
                "Learn about our commitment to environmental responsibility through sustainable materials, eco-friendly inks, and ethical manufacturing practices.",
            link: "/blog/sustainable-art",
            date: "March 7, 2025",
            readTime: "4 min read",
            author: "Thomas Greene",
            category: "Sustainability",
        },
    ];

    const categories = [
        "Interior Design",
        "Photography Tips",
        "Care & Maintenance",
        "Design Ideas",
        "Color Theory",
        "Sustainability",
        "Customer Stories",
        "Product Updates",
    ];

    return (
        <InfocusLayout>
            <div className="w-full bg-gradient-to-b from-[#f9fef7] to-[#f0f9ed] py-6 md:py-12">
                <div className="container mx-auto px-4 sm:px-6">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#4a9936] to-[#5fba45] text-white p-4 md:p-6 mb-6 rounded-lg shadow-md">
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
                            Canvas Creations Blog
                        </h1>
                    </div>

                    {/* Breadcrumb */}
                    <div className="flex items-center mb-6 md:mb-8 text-sm">
                        <Link
                            href="/"
                            className="text-gray-600 hover:text-[#4a9936] transition-colors"
                        >
                            Home
                        </Link>
                        <span className="mx-2 text-gray-400">/</span>
                        <span className="text-[#4a9936] font-medium">Blog</span>
                    </div>

                    {/* Featured Post */}
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl md:text-2xl font-semibold text-[#333333] border-l-4 border-[#4a9936] pl-4">
                                Featured Article
                            </h2>
                            <Link
                                href="/blog"
                                className="text-[#4a9936] hover:text-[#3d7f2d] font-medium flex items-center gap-1"
                            >
                                View All <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        <Card className="overflow-hidden border border-gray-100 rounded-xl hover:shadow-xl transition-shadow duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2">
                                <div className="relative">
                                    <img
                                        src={featuredPost.image}
                                        alt={featuredPost.title}
                                        className="w-full h-64 md:h-full object-cover"
                                    />
                                    <Badge className="absolute top-4 left-4 bg-[#4a9936] text-white px-3 py-1 font-medium text-xs rounded-full shadow-md">
                                        Featured
                                    </Badge>
                                </div>
                                <div className="p-6 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-3 text-sm text-gray-500">
                                            <Badge
                                                variant="outline"
                                                className="text-[#4a9936] border-[#4a9936]"
                                            >
                                                {featuredPost.category}
                                            </Badge>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                <span>{featuredPost.date}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3.5 w-3.5" />
                                                <span>
                                                    {featuredPost.readTime}
                                                </span>
                                            </div>
                                        </div>

                                        <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">
                                            {featuredPost.title}
                                        </h3>

                                        <p className="text-gray-600 mb-4">
                                            {featuredPost.excerpt}
                                        </p>

                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="h-8 w-8 bg-[#4a9936] rounded-full flex items-center justify-center text-white font-semibold">
                                                {featuredPost.author.charAt(0)}
                                            </div>
                                            <span className="text-sm text-gray-600">
                                                By {featuredPost.author}
                                            </span>
                                        </div>
                                    </div>

                                    <Button
                                        asChild
                                        className="bg-[#4a9936] hover:bg-[#3d7f2d] text-white rounded-full font-medium transition-colors shadow-sm w-full md:w-auto"
                                    >
                                        <Link
                                            href={featuredPost.link}
                                            className="flex items-center justify-center gap-2"
                                        >
                                            Read Full Article
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Recent Posts */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl md:text-2xl font-semibold text-[#333333] border-l-4 border-[#4a9936] pl-4">
                                    Recent Posts
                                </h2>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-gray-200 text-gray-500 hover:text-[#4a9936] hover:border-[#4a9936]"
                                    >
                                        Newest
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-gray-200 text-gray-500 hover:text-[#4a9936] hover:border-[#4a9936]"
                                    >
                                        Popular
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {recentPosts.map((post) => (
                                    <Card
                                        key={post.id}
                                        className="overflow-hidden border border-gray-100 rounded-xl hover:shadow-lg transition-shadow duration-300"
                                    >
                                        <div className="grid grid-cols-1 sm:grid-cols-3">
                                            <div className="relative">
                                                <img
                                                    src={post.image}
                                                    alt={post.title}
                                                    className="w-full h-48 sm:h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                                            </div>
                                            <div className="sm:col-span-2 p-5">
                                                <div className="flex items-center gap-3 mb-2 text-xs text-gray-500">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[#4a9936] border-[#4a9936]"
                                                    >
                                                        {post.category}
                                                    </Badge>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>{post.date}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        <span>
                                                            {post.readTime}
                                                        </span>
                                                    </div>
                                                </div>

                                                <h3 className="text-lg font-bold text-gray-800 mb-2 hover:text-[#4a9936] transition-colors">
                                                    <Link href={post.link}>
                                                        {post.title}
                                                    </Link>
                                                </h3>

                                                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                                    {post.excerpt}
                                                </p>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-7 w-7 bg-[#4a9936] rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                                            {post.author.charAt(
                                                                0
                                                            )}
                                                        </div>
                                                        <span className="text-xs text-gray-600">
                                                            By {post.author}
                                                        </span>
                                                    </div>

                                                    <Link
                                                        href={post.link}
                                                        className="text-sm text-[#4a9936] hover:text-[#3d7f2d] font-medium flex items-center gap-1"
                                                    >
                                                        Read More{" "}
                                                        <ArrowRight className="h-3.5 w-3.5" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            <div className="mt-8 flex justify-center">
                                <Button className="bg-white border border-[#4a9936] text-[#4a9936] hover:bg-[#f0f9ed] hover:text-[#3d7f2d] rounded-full font-medium transition-colors shadow-sm">
                                    Load More Posts
                                </Button>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            {/* Search */}
                            <Card className="overflow-hidden border border-gray-100 rounded-xl">
                                <CardContent className="p-5">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                        Search Articles
                                    </h3>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search posts..."
                                            className="w-full px-4 py-2 pl-4 pr-10 rounded-full border border-gray-200 focus:border-[#4a9936] focus:ring focus:ring-[#4a9936]/20 focus:outline-none"
                                        />
                                        <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#4a9936]">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Categories */}
                            <Card className="overflow-hidden border border-gray-100 rounded-xl">
                                <CardContent className="p-5">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                        Categories
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((category, index) => (
                                            <Link
                                                key={index}
                                                href={`/blog/category/${category
                                                    .toLowerCase()
                                                    .replace(/\s+/g, "-")}`}
                                            >
                                                <Badge className="bg-[#f0f9ed] text-[#4a9936] hover:bg-[#4a9936] hover:text-white cursor-pointer transition-colors px-3 py-1">
                                                    {category}
                                                </Badge>
                                            </Link>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Newsletter */}
                            <Card className="overflow-hidden border border-gray-100 rounded-xl">
                                <CardContent className="p-5">
                                    <div className="bg-[#f0f9ed] -m-5 mb-5 p-5">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                            Subscribe to Our Newsletter
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-0">
                                            Get the latest canvas inspiration
                                            and exclusive offers
                                        </p>
                                    </div>
                                    <div className="space-y-3">
                                        <input
                                            type="email"
                                            placeholder="Your email address"
                                            className="w-full px-4 py-2 rounded-full border border-gray-200 focus:border-[#4a9936] focus:ring focus:ring-[#4a9936]/20 focus:outline-none"
                                        />
                                        <Button className="w-full bg-[#4a9936] hover:bg-[#3d7f2d] text-white rounded-full font-medium transition-colors shadow-sm">
                                            Subscribe
                                        </Button>
                                        <p className="text-xs text-gray-500 text-center">
                                            We respect your privacy. Unsubscribe
                                            anytime.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Popular Tags */}
                            <Card className="overflow-hidden border border-gray-100 rounded-xl">
                                <CardContent className="p-5">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                        Popular Tags
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge
                                            variant="outline"
                                            className="border-gray-200 text-gray-600 hover:border-[#4a9936] hover:text-[#4a9936]"
                                        >
                                            Canvas Prints
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="border-gray-200 text-gray-600 hover:border-[#4a9936] hover:text-[#4a9936]"
                                        >
                                            Home Decor
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="border-gray-200 text-gray-600 hover:border-[#4a9936] hover:text-[#4a9936]"
                                        >
                                            Photo Tips
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="border-gray-200 text-gray-600 hover:border-[#4a9936] hover:text-[#4a9936]"
                                        >
                                            Artwork
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="border-gray-200 text-gray-600 hover:border-[#4a9936] hover:text-[#4a9936]"
                                        >
                                            Interior Design
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="border-gray-200 text-gray-600 hover:border-[#4a9936] hover:text-[#4a9936]"
                                        >
                                            DIY
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="border-gray-200 text-gray-600 hover:border-[#4a9936] hover:text-[#4a9936]"
                                        >
                                            Gift Ideas
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="border-gray-200 text-gray-600 hover:border-[#4a9936] hover:text-[#4a9936]"
                                        >
                                            Wall Art
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </InfocusLayout>
    );
};

export default RecentBlogs;
