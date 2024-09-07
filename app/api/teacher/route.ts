import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth"

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        console.log(session);
        if (
            !session ||
            !session.user
            //   || session.user.role !== "HOD"
        ) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // if (!session.user.collegeId) {
        //     return NextResponse.json(
        //         { message: "College not associated with HOD" },
        //         { status: 400 }
        //     );
        // }
        if (session.user.role !== "SBTE_ADMIN" && session.user.role !== "EDUCATION_DEPARTMENT") {
            const teachers = await prisma.teacher.findMany({
                where: {
                    user: {
                        collegeId: session.user.collegeId,
                    },
                },
                select: {
                    id: true,
                    name: true,
                    phoneNo: true,
                    address: true,
                    qualification: true,
                    designation: true,
                    experience: true,
                    user: {
                        select: {
                            username: true,
                            email: true,
                            college: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                            department: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
            });
            return NextResponse.json(teachers);
        } else {
            const teachers = await prisma.teacher.findMany({
                // where: {
                //   user: {
                //     collegeId: session.user.collegeId,
                //   },
                // },
                select: {
                    id: true,
                    name: true,
                    phoneNo: true,
                    address: true,
                    qualification: true,
                    designation: true,
                    experience: true,
                    user: {
                        select: {
                            username: true,
                            email: true,
                            college: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                            department: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
            });
            return NextResponse.json(teachers);
        }
    } catch (error) {
        console.error("Error fetching teachers:", error);
        return NextResponse.json(
            { message: "Error fetching teachers", error: (error as Error).message },
            { status: 500 }
        );
    }
}
