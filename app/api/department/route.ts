import prisma from "@/prisma/client";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const data = await request.json();
        console.log(data);
        const { creator_id, name, isActive, collegeId } = data;

        const creator = await prisma.user.findUnique({
            where:{
                id:creator_id,
            },
            select:{
                role:true,
            },
        });
        console.log(creator);
        
        if (!creator) {
            console.error("User not found");
            return new NextResponse("User not found", { status: 404 });
        }

        // const newDepartment = await prisma.department.create(
        //     {
        //         data: {
        //             name,
        //             isActive,
        //             college: {
        //                 connect: { id: collegeId },
        //             },
        //         }
        //     }
        // );
        // return NextResponse.json(newDepartment);
        return NextResponse.json({'hello':"world"});

    } catch (error) {
        console.error("Error Creating Department:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function GET(): Promise<NextResponse> {
    try {
        const departments = await prisma.department.findMany();
        return NextResponse.json(departments);
    } catch (error) {
        console.error("Error fetching departments:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}


