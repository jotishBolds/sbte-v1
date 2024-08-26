import prisma from "@/prisma/client";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const data = await request.json();
        console.log(data);
        const {
            name,
            address,
            establishedOn,
            websiteUrl,
            contactEmail,
            contactPhone,
        } = data;
        const newCollege = await prisma.college.create(
            {
                data: {
                    name,
                    address,
                    establishedOn: new Date(establishedOn),
                    websiteUrl,
                    contactEmail,
                    contactPhone,
                }
            }
        );
        return NextResponse.json(newCollege);
    } catch (error) {
        console.error("Error Creating college:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function GET(): Promise<NextResponse> {
    try {
        const colleges = await prisma.college.findMany();
        return NextResponse.json(colleges);
    } catch (error) {
        console.error("Error fetching college:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

