import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth"
import bcrypt from "bcrypt";

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const data = await request.json();
        let {
            email, password, username,collegeId,
            name, phoneNo, dateOfBirth, address,
            departmentId, batchYear, graduationYear,
            gpa, jobStatus, currentEmployer, currentPosition,
            industry, linkedInProfile, achievements
        } = data;

        // Validating the required fields
        if (!email || !password || !username || !name || !collegeId || !departmentId || !batchYear || !graduationYear) {
            return new NextResponse(JSON.stringify({ message: "All required fields (email, password, username, name, collegeId, departmentId, batchyear, graduationYear) must be provided" }), { status: 400 });
        }

        // Checking if the user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return new NextResponse(JSON.stringify({ message: "User with this email already exists" }), { status: 409 });
        }

        // Hashing the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        //checking if the gpa field is empty or not and if so then pass null as it seems we 
        // need to pass something or else it shows some error
        if (gpa !== undefined && gpa !== null && gpa !== "") {
            gpa = parseFloat(gpa);
            if (isNaN(gpa)) {
                return new NextResponse(JSON.stringify({ message: "Invalid GPA value" }), { status: 400 });
            }
        } else {
            gpa = null; // Set gpa to null if it's not provided
        }


        // Create the user and alumnus records
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                username,
                role: "ALUMNUS",
                collegeId,
                departmentId,
                alumnus: {
                    create: {
                        name,
                        phoneNo,
                        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                        address,
                        departmentId,
                        batchYear,
                        graduationYear,
                        gpa,
                        jobStatus,
                        currentEmployer,
                        currentPosition,
                        industry,
                        linkedInProfile,
                        achievements
                    }
                }
            }
        });

        return NextResponse.json({ message: "Alumnus registered successfully", user: newUser }, { status: 201 });

    } catch (error) {
        console.error("Error registering alumnus:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

  




