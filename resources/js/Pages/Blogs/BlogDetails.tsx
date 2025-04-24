import React from "react";
import { Link } from "@inertiajs/react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import {
    ArrowRight,
    Calendar,
    Clock,
    UserRound,
    Tag,
    Heart,
    MessageSquare,
    Share2,
    Bookmark,
    Facebook,
    Twitter,
    Linkedin,
    Copy,
} from "lucide-react";
import InfocusLayout from "@/Components/Layouts/InfocusLayout";

interface Author {
    id: number;
    name: string;
    avatar: string;
    role: string;
    bio: string;
}

interface BlogPostDetail {
    id: number;
    title: string;
    image: string;
    content: string;
    date: string;
    readTime: string;
    author: Author;
    category: string;
    tags: string[];
    likes: number;
    comments: number;
}

interface RelatedPost {
    id: number;
    title: string;
    image: string;
    link: string;
    date: string;
}

interface Comment {
    id: number;
    author: string;
    avatar: string;
    date: string;
    content: string;
    replies?: Comment[];
}

const BlogPostDetail: React.FC = () => {
    // Sample data for demonstration
    const blogPost: BlogPostDetail = {
        id: 1,
        title: "Transform Your Space: The Ultimate Guide to Canvas Arrangements",
        image: "/assets/placeholder.jpg",
        content: `
<p class="text-lg mb-6 leading-relaxed">Creating a stunning canvas display is more than just hanging pictures on a wall—it's about crafting a visual story that transforms your living space. Whether you're designing a feature wall in your living room or adding personality to a home office, thoughtful canvas arrangements can elevate any interior.</p>

<h2 class="text-2xl font-bold mb-4 text-gray-800 mt-8">The Science of Visual Balance</h2>

<p class="mb-4">When arranging multiple canvas pieces, consider these fundamental principles that professional designers follow:</p>

<ul class="list-disc pl-6 mb-6 space-y-2">
  <li><strong>Rule of Thirds:</strong> Divide your wall space into a 3×3 grid and place focal points at the intersections for the most visually pleasing arrangement.</li>
  <li><strong>Visual Weight:</strong> Larger or more vibrant pieces carry more "weight" and should be balanced with smaller or more subdued pieces.</li>
  <li><strong>Consistent Spacing:</strong> Maintain equal distances between pieces to create harmony—typically 2-3 inches for small arrangements and 4-6 inches for larger displays.</li>
</ul>

<div class="bg-[#f0f9ed] p-6 rounded-lg mb-8 border-l-4 border-[#4a9936]">
  <h3 class="font-bold text-lg mb-2">Designer Tip</h3>
  <p>Before hanging your canvas prints, arrange them on the floor first. This allows you to experiment with different configurations without making unnecessary holes in your wall.</p>
</div>

<h2 class="text-2xl font-bold mb-4 text-gray-800 mt-8">Creating Thematic Cohesion</h2>

<p class="mb-6">A successful canvas arrangement tells a unified story through visual elements:</p>

<ol class="list-decimal pl-6 mb-6 space-y-2">
  <li><strong>Color Harmony:</strong> Choose pieces that share a compatible color palette or incorporate accent colors from your room's existing decor.</li>
  <li><strong>Subject Continuity:</strong> Select images that share a common theme—whether it's natural landscapes, family portraits, or abstract designs.</li>
  <li><strong>Style Consistency:</strong> Maintain a cohesive look by selecting pieces with similar artistic styles, even when the subjects differ.</li>
</ol>

<figure class="my-8">
  <img src="/assets/heroone.png" alt="Canvas arrangement example" class="rounded-lg w-full h-auto object-cover" />
  <figcaption class="text-sm text-gray-500 mt-2 text-center">A balanced three-piece canvas arrangement creating visual interest while maintaining thematic unity.</figcaption>
</figure>

<h2 class="text-2xl font-bold mb-4 text-gray-800 mt-8">Arrangement Patterns for Different Spaces</h2>

<p class="mb-6">Different rooms and wall spaces call for different arrangement strategies:</p>

<h3 class="text-xl font-semibold mb-3 text-gray-700">Above Furniture</h3>
<p class="mb-4">When hanging canvas prints above sofas, beds, or consoles, follow these guidelines:</p>
<ul class="list-disc pl-6 mb-6 space-y-2">
  <li>The arrangement should be approximately 2/3 the width of the furniture below it</li>
  <li>Hang the bottom edge 8-10 inches above the furniture top</li>
  <li>Center the arrangement relative to the furniture, not necessarily the wall</li>
</ul>

<h3 class="text-xl font-semibold mb-3 text-gray-700">Staircase Galleries</h3>
<p class="mb-4">Staircase walls present unique opportunities for dynamic canvas displays:</p>
<ul class="list-disc pl-6 mb-6 space-y-2">
  <li>Follow the diagonal line of the stairs while keeping each piece level</li>
  <li>Maintain consistent spacing between pieces (typically 4-6 inches)</li>
  <li>Consider a gradual transition in themes or colors to create visual movement</li>
</ul>

<div class="bg-[#f0f9ed] p-6 rounded-lg mb-8 border-l-4 border-[#4a9936]">
  <h3 class="font-bold text-lg mb-2">Professional Insight</h3>
  <p>For high-impact arrangements, consider the "hero piece" approach—featuring one larger, dominant canvas supported by smaller complementary pieces.</p>
</div>

<p class="mb-6">Remember that the most impressive canvas arrangements often evolve over time. Start with foundational pieces and allow your collection to grow organically as you discover new images that speak to your aesthetic vision.</p>

<p class="text-lg font-semibold mb-8">Ready to transform your space with stunning canvas art? Browse our collections to find the perfect pieces for your arrangement.</p>
        `,
        date: "April 2, 2025",
        readTime: "8 min read",
        author: {
            id: 1,
            name: "Emma Richardson",
            avatar: "/assets/placeholder.jpg",
            role: "Senior Interior Design Specialist",
            bio: "Emma has over 15 years of experience in interior design and visual merchandising. She specializes in creating harmonious living spaces through strategic art placement and color theory.",
        },
        category: "Interior Design",
        tags: [
            "Canvas Arrangements",
            "Wall Art",
            "Interior Design",
            "Home Decor",
            "Design Tips",
        ],
        likes: 137,
        comments: 24,
    };

    const relatedPosts: RelatedPost[] = [
        {
            id: 2,
            title: "From Photo to Masterpiece: Selecting Images for Canvas Printing",
            image: "/assets/placeholder.jpg",
            link: "/blog/photo-to-masterpiece",
            date: "March 28, 2025",
        },
        {
            id: 3,
            title: "Art Conservation: Maintaining Your Canvas Prints for Decades",
            image: "/assets/placeholder.jpg",
            link: "/blog/art-conservation",
            date: "March 23, 2025",
        },
        {
            id: 4,
            title: "Gallery Walls: Creating Cohesive Multi-Canvas Displays",
            image: "/assets/placeholder.jpg",
            link: "/blog/gallery-walls",
            date: "March 19, 2025",
        },
    ];

    const comments: Comment[] = [
        {
            id: 1,
            author: "Sarah Johnson",
            avatar: "/assets/blogs/comments/user1.png",
            date: "April 3, 2025",
            content:
                "This guide came at the perfect time! I've been struggling with arranging my family photos in our living room. The rule of thirds tip really helped me create a more balanced look. Thank you!",
            replies: [
                {
                    id: 11,
                    author: "Emma Richardson",
                    avatar: "/assets/blogs/authors/emma.png",
                    date: "April 4, 2025",
                    content:
                        "I'm so glad you found it helpful, Sarah! Family photos can be tricky to arrange because of their emotional significance. Feel free to share photos of your new arrangement!",
                },
            ],
        },
        {
            id: 2,
            author: "Michael Torres",
            avatar: "/assets/blogs/comments/user2.png",
            date: "April 3, 2025",
            content:
                "I've always been intimidated by creating gallery walls, but your floor arrangement tip is genius. It made the process so much easier! Just ordered three more canvas prints to complete my staircase gallery.",
        },
    ];

    // Sample data for More From This Category section
    const categoryPosts = [
        {
            id: 5,
            title: "Color Theory: Creating Emotional Impact with Canvas Art",
            image: "/assets/blogs/blog-4.png",
            excerpt:
                "Learn how color selection in your canvas art can influence mood and perception in your interior spaces.",
            link: "/blog/color-theory-canvas-art",
            date: "March 25, 2025",
            readTime: "6 min read",
        },
        {
            id: 6,
            title: "Lighting Your Canvas: Illumination Tips for Perfect Display",
            image: "/assets/blogs/blog-5.png",
            excerpt:
                "Discover professional techniques for lighting your canvas prints to maximize visual impact and protect your investment.",
            link: "/blog/lighting-your-canvas",
            date: "March 21, 2025",
            readTime: "5 min read",
        },
        {
            id: 7,
            title: "Mixing Media: Combining Canvas Art with Other Wall Decor",
            image: "/assets/blogs/blog-6.png",
            excerpt:
                "Expert advice on creating dynamic wall displays by combining canvas prints with mirrors, shelving, and other decorative elements.",
            link: "/blog/mixing-media-canvas",
            date: "March 15, 2025",
            readTime: "7 min read",
        },
        {
            id: 8,
            title: "Small Space Solutions: Canvas Arrangements for Apartments",
            image: "/assets/blogs/blog-7.png",
            excerpt:
                "Creative ways to incorporate canvas art in smaller living spaces without overwhelming the room.",
            link: "/blog/small-space-canvas",
            date: "March 12, 2025",
            readTime: "4 min read",
        },
    ];

    return (
        <InfocusLayout>
            <div className="w-full bg-gradient-to-b from-[#f9fef7] to-[#f0f9ed] py-6 md:py-12">
                <div className="container mx-auto px-4 sm:px-6">
                    {/* Breadcrumb */}
                    <div className="flex items-center mb-6 md:mb-8 text-sm">
                        <Link
                            href="/"
                            className="text-gray-600 hover:text-[#4a9936] transition-colors"
                        >
                            Home
                        </Link>
                        <span className="mx-2 text-gray-400">/</span>
                        <Link
                            href="/blog"
                            className="text-gray-600 hover:text-[#4a9936] transition-colors"
                        >
                            Blog
                        </Link>
                        <span className="mx-2 text-gray-400">/</span>
                        <span className="text-[#4a9936] font-medium">
                            {blogPost.title.length > 30
                                ? blogPost.title.substring(0, 30) + "..."
                                : blogPost.title}
                        </span>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            {/* Article Header */}
                            <div className="mb-8">
                                <Badge
                                    variant="outline"
                                    className="text-[#4a9936] border-[#4a9936] mb-3"
                                >
                                    {blogPost.category}
                                </Badge>

                                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-gray-800 mb-4">
                                    {blogPost.title}
                                </h1>

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full overflow-hidden">
                                            <img
                                                src={blogPost.author.avatar}
                                                alt={blogPost.author.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">
                                                {blogPost.author.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {blogPost.author.role}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="w-px h-10 bg-gray-200"></div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            <span>{blogPost.date}</span>
                                        </div>
                                        <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300"></div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            <span>{blogPost.readTime}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full h-auto rounded-xl overflow-hidden mb-6">
                                    <img
                                        src={blogPost.image}
                                        alt={blogPost.title}
                                        className="w-full h-auto object-cover"
                                    />
                                </div>

                                {/* Social Share Bar */}
                                <div className="flex items-center justify-between py-3 border-y border-gray-200">
                                    <div className="flex items-center gap-4">
                                        <button className="flex items-center gap-1 text-gray-600 hover:text-[#4a9936]">
                                            <Heart className="h-4 w-4" />
                                            <span className="text-sm">
                                                {blogPost.likes}
                                            </span>
                                        </button>
                                        <button className="flex items-center gap-1 text-gray-600 hover:text-[#4a9936]">
                                            <MessageSquare className="h-4 w-4" />
                                            <span className="text-sm">
                                                {blogPost.comments}
                                            </span>
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button className="text-gray-600 hover:text-[#4a9936]">
                                            <Facebook className="h-4 w-4" />
                                        </button>
                                        <button className="text-gray-600 hover:text-[#4a9936]">
                                            <Twitter className="h-4 w-4" />
                                        </button>
                                        <button className="text-gray-600 hover:text-[#4a9936]">
                                            <Linkedin className="h-4 w-4" />
                                        </button>
                                        <button className="text-gray-600 hover:text-[#4a9936]">
                                            <Copy className="h-4 w-4" />
                                        </button>
                                        <button className="text-gray-600 hover:text-[#4a9936]">
                                            <Bookmark className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Article Content */}
                            <div className="prose prose-lg max-w-none mb-12">
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: blogPost.content,
                                    }}
                                />
                            </div>

                            {/* Tags */}
                            {/* <div className="mb-8">
                                <div className="flex flex-wrap gap-2 items-center">
                                    <span className="font-medium text-gray-700 flex items-center">
                                        <Tag className="h-4 w-4 mr-2" /> Tags:
                                    </span>
                                    {blogPost.tags.map((tag, index) => (
                                        <Link
                                            key={index}
                                            href={`/blog/tag/${tag
                                                .toLowerCase()
                                                .replace(/\s+/g, "-")}`}
                                        >
                                            <Badge className="bg-[#f0f9ed] text-[#4a9936] hover:bg-[#4a9936] hover:text-white cursor-pointer transition-colors">
                                                {tag}
                                            </Badge>
                                        </Link>
                                    ))}
                                </div>
                            </div> */}

                            {/* Author Bio */}
                            <Card className="mb-12 overflow-hidden border border-gray-100 rounded-xl bg-[#f9fef7]">
                                <CardContent className="p-6">
                                    <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                                        <div className="w-20 h-20 rounded-full overflow-hidden shrink-0">
                                            <img
                                                src={blogPost.author.avatar}
                                                alt={blogPost.author.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="text-center sm:text-left">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                                {blogPost.author.name}
                                            </h3>
                                            <p className="text-sm text-[#4a9936] mb-3">
                                                {blogPost.author.role}
                                            </p>
                                            <p className="text-gray-600 mb-4">
                                                {blogPost.author.bio}
                                            </p>
                                            <div className="flex justify-center sm:justify-start gap-3">
                                                <button className="text-gray-600 hover:text-[#4a9936]">
                                                    <Facebook className="h-4 w-4" />
                                                </button>
                                                <button className="text-gray-600 hover:text-[#4a9936]">
                                                    <Twitter className="h-4 w-4" />
                                                </button>
                                                <button className="text-gray-600 hover:text-[#4a9936]">
                                                    <Linkedin className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Comments */}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            {/* Related Posts */}
                            <Card className="overflow-hidden border border-gray-100 rounded-xl">
                                <CardContent className="p-5">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-[#4a9936] pl-4">
                                        Related Articles
                                    </h3>
                                    <div className="space-y-4">
                                        {relatedPosts.map((post) => (
                                            <div
                                                key={post.id}
                                                className="flex gap-3"
                                            >
                                                <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                                                    <img
                                                        src={post.image}
                                                        alt={post.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-800 line-clamp-2 mb-1 hover:text-[#4a9936]">
                                                        <Link href={post.link}>
                                                            {post.title}
                                                        </Link>
                                                    </h4>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>{post.date}</span>
                                                    </div>
                                                </div>
                                            </div>
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

export default BlogPostDetail;
