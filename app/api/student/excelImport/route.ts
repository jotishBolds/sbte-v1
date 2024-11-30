//Things to remember
//The emails in the excel file should not be a hyper link or we need to consider for this in the later stage
//The batchYear attribute needs to a year that exists in the batch Years of the system
//The admissionYear attribute needs to a year that exists in the admission Years of the system
//The academicYear attribute needs to be a name of the Academic Year in the system
//The term attribute needs to be a name of the semester in the system
//The program attribute needs to be a name of a program that exists in the system
//The department attribute needs to be a name of the department that exists in the system

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { hash } from "bcrypt";
import prisma from "@/src/lib/prisma";
import { z } from "zod";
import ExcelJS from "exceljs";

// Define Zod validation schemas based on your User and Student models
const userSchema = z.object({
  username: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum([
    "ADMIN",
    "STUDENT",
    "TEACHER",
    "FINANCEMANAGER",
    "ALUMNUS",
    "HOD",
  ]),
  collegeId: z.string().optional(),
  departmentId: z.string().optional(),
});

const studentSchema = z.object({
  name: z.string(),
  dob: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format for DOB",
    })
    .transform((val) => new Date(val)),
  personalEmail: z.string().email(),
  enrollmentNo: z.string().optional(),
  phoneNo: z.string(),
  studentAvatar: z.string().optional(),
  abcId: z.string().optional(),
  lastCollegeAttended: z.string().optional(),
  batchYearId: z.string(),
  admissionYearId: z.string(),
  academicYearId: z.string(),
  termId: z.string(),
  gender: z.enum(["Male", "Female", "Other"]),
  isLocalStudent: z.boolean().default(false),
  isDifferentlyAbled: z.boolean().default(false),
  motherName: z.string(),
  fatherName: z.string(),
  bloodGroup: z.string().optional(),
  religion: z.string().optional(),
  nationality: z.string().optional(),
  caste: z.string().optional(),
  admissionCategory: z.string().optional(),
  resident: z.string().optional(),
  admissionDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format for Admission Date",
    })
    .transform((val) => new Date(val)),
  graduateDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  permanentAddress: z.string(),
  permanentCountry: z.string(),
  permanentState: z.string(),
  permanentCity: z.string(),
  permanentPincode: z.string(),
  guardianName: z.string().optional(),
  guardianGender: z.string().optional(),
  guardianEmail: z.string().email().optional(),
  guardianMobileNo: z.string().optional(),
  guardianRelation: z.string().optional(),
  programId: z.string(),
  departmentId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const collegeId = session?.user?.collegeId;

    if (!collegeId) {
      return NextResponse.json(
        { error: "No college ID found in session" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await file.arrayBuffer());
    const worksheet = workbook.worksheets[0];

    const jsonData: any[] = [];
    const emailMap = new Map<string, number[]>(); // To track emails and their row indexes
    const existingEmails: string[] = []; // To store existing emails found in the database
    const duplicateEmailsInFile: { email: string; rows: number[] }[] = [];
    const personalEmailMap = new Map<string, number[]>(); // For personalEmail duplicate tracking
    const duplicatePersonalEmailsInFile: {
      personalEmail: string;
      rows: number[];
    }[] = []; // To store duplicate personalEmails in the Excel file
    const existingPersonalEmails: string[] = []; // To store existing personalEmails found in the database

    const missingEmailRows: number[] = []; // Track rows with missing emails
    const missingPersonalEmailRows: number[] = []; // Track rows with missing emails

    const missingAcademicYearRows: number[] = [];
    const missingAdmissionYearRows: number[] = [];
    const missingBatchYearRows: number[] = [];
    const missingProgramRows: number[] = [];
    const missingDepartmentRows: number[] = [];
    const missingTermRows: number[] = [];
    let errorMessages = [];
    let rowAcademicYearId: string | null = null;
    let rowAdmissionYearId: string | null = null;
    let rowBatchYearId: string | null = null;
    let rowProgramId: string | null = null;
    let rowDepartmentId: string | null = null;
    let rowTermId: string | null = null;

    // Sequentially process each row for async operations
    for (const row of worksheet.getRows(2, worksheet.rowCount - 1) || []) {
      // Skips the header row
      if (!row.hasValues) continue; // Skip rows with no values

      const rowData: Record<string, any> = {};
      let hasEmail = false; // Track if email is present
      let hasPersonalEmail = false;

      row.eachCell((cell, colNumber) => {
        const cellValue = cell.value;
        switch (colNumber) {
          case 1:
            rowData["username"] = cellValue;
            break;
          case 2:
            rowData["email"] = cellValue;
            hasEmail = Boolean(cellValue);
            break;
          case 3:
            rowData["password"] = cellValue;
            break;

          case 4:
            rowData["name"] = cellValue;
            break;
          case 5:
            rowData["enrollmentNo"] = cellValue;
            break;
          case 6:
            rowData["dob"] = cellValue;
            break;
          case 7:
            rowData["personalEmail"] = cellValue;
            hasPersonalEmail = Boolean(cellValue);
            break;
          case 8:
            rowData["phoneNo"] = cellValue;
            break;
          case 9:
            rowData["studentAvatar"] = cellValue;
            break;
          case 10:
            rowData["abcId"] = cellValue;
            break;
          case 11:
            rowData["lastCollegeAttended"] = cellValue;
            break;
          case 12:
            rowData["batchYear"] = cellValue;
            break;
          case 13:
            rowData["admissionYear"] = cellValue;
            break;
          case 14:
            rowData["academicYear"] = cellValue;
            break;
          case 15:
            rowData["term"] = cellValue;
            console.log("term", rowData["term"]);
            break;
          case 16:
            rowData["gender"] = cellValue;
            break;
          case 17:
            rowData["isLocalStudent"] = cellValue;
            break;
          case 18:
            rowData["isDifferentlyAbled"] = cellValue;
            break;
          case 19:
            rowData["motherName"] = cellValue;
            break;
          case 20:
            rowData["fatherName"] = cellValue;
            break;
          case 21:
            rowData["bloodGroup"] = cellValue;
            break;
          case 22:
            rowData["religion"] = cellValue;
            break;
          case 23:
            rowData["nationality"] = cellValue;
            break;
          case 24:
            rowData["caste"] = cellValue;
            break;
          case 25:
            rowData["admissionCategory"] = cellValue;
            break;
          case 26:
            rowData["resident"] = cellValue;
            break;
          case 27:
            rowData["admissionDate"] = cellValue;
            break;
          case 28:
            rowData["graduateDate"] = cellValue;
            break;
          case 29:
            rowData["permanentAddress"] = cellValue;
            break;
          case 30:
            rowData["permanentCountry"] = cellValue;
            break;
          case 31:
            rowData["permanentState"] = cellValue;
            break;
          case 32:
            rowData["permanentCity"] = cellValue;
            break;
          case 33:
            rowData["permanentPincode"] = cellValue;
            break;
          case 34:
            rowData["guardianName"] = cellValue;
            break;
          case 35:
            rowData["guardianGender"] = cellValue;
            break;
          case 36:
            rowData["guardianEmail"] = cellValue;
            break;
          case 37:
            rowData["guardianMobileNo"] = cellValue;
            break;
          case 38:
            rowData["guardianRelation"] = cellValue;
            break;
          case 39:
            rowData["program"] = cellValue;
            break;
          case 40:
            rowData["department"] = cellValue;
            break;
        }
      });

      if (!hasEmail) {
        missingEmailRows.push(row.number); // Add row to missing email list if no email is present
        continue;
      }
      if (!hasPersonalEmail) {
        missingPersonalEmailRows.push(row.number); // Add row to missing email list if no email is present
        continue;
      }

      // Track emails and their row numbers
      if (rowData.email) {
        const email = rowData.email.toString().toLowerCase(); // Normalize email
        if (!emailMap.has(email)) {
          emailMap.set(email, []);
        }
        emailMap.get(email)!.push(row.number); // Store the row number
      }

      if (hasPersonalEmail) {
        const personalEmail = rowData.personalEmail.toString().toLowerCase();
        if (!personalEmailMap.has(personalEmail)) {
          personalEmailMap.set(personalEmail, []);
        }
        personalEmailMap.get(personalEmail)!.push(row.number);
      }

      console.log("emailMap", emailMap);

      rowData["collegeId"] = collegeId;

      // Process dates and numbers as strings for validation
      ["dob", "admissionDate", "graduateDate"].forEach((dateField) => {
        if (rowData[dateField] instanceof Date) {
          rowData[dateField] = rowData[dateField].toISOString().split("T")[0];
        }
      });
      ["phoneNo", "permanentPincode", "guardianMobileNo"].forEach(
        (numField) => {
          if (typeof rowData[numField] === "number") {
            rowData[numField] = rowData[numField].toString();
          }
        }
      );

      rowData.admissionYear = +rowData.admissionYear;
      rowData.batchYear = +rowData.batchYear;

      // rowData.admissionYear = parseInt(rowData.admissionYear, 10);
      console.log("admissionYear: " + rowData.admissionYear);
      console.log("batchYear: " + rowData.batchYear);
      console.log("term: " + rowData.term);
      console.log("academicYear: " + rowData.academicYear);
      console.log("program: " + rowData.program);
      console.log("department: " + rowData.department);

      // rowData.batchYear = parseInt(rowData.batchYear, 10);

      // Fetch IDs based on names/years from other models
      let academicYearId = null;
      if (rowData.academicYear) {
        const academicYear = await prisma.academicYear.findMany({
          where: { name: rowData.academicYear },
          take: 1, // Limit to one result
        });
        academicYearId = academicYear.length > 0 ? academicYear[0].id : null;
        if (!academicYearId) {
          missingAcademicYearRows.push(row.number);
        }
      } else {
        missingAcademicYearRows.push(row.number);
      }

      // Fetch admissionYearId if admissionYear is a valid number
      let admissionYearId = null;
      if (!isNaN(rowData.admissionYear)) {
        const admissionYear = await prisma.admissionYear.findMany({
          where: { year: rowData.admissionYear },
          take: 1, // Limit to one result
        });
        admissionYearId = admissionYear.length > 0 ? admissionYear[0].id : null;
        if (!admissionYearId) {
          missingAdmissionYearRows.push(row.number);
        }
      } else {
        missingAdmissionYearRows.push(row.number);
        console.log(
          `Invalid admissionYear value in row ${row.number}: setting admissionYearId to null.`
        );
      }

      // Fetch batchYearId if batchYear is a valid number
      let batchYearId = null;
      if (!isNaN(rowData.batchYear)) {
        const batchYear = await prisma.batchYear.findMany({
          where: { year: rowData.batchYear },
          take: 1, // Limit to one result
        });
        batchYearId = batchYear.length > 0 ? batchYear[0].id : null;
        if (!batchYearId) {
          missingBatchYearRows.push(row.number);
        }
      } else {
        missingBatchYearRows.push(row.number);
        console.log(
          `Invalid batchYear value in row ${row.number}: setting batchYearId to null.`
        );
      }

      let programId = null;
      if (rowData.program) {
        const program = await prisma.program.findMany({
          where: { name: rowData.program },
          take: 1, // Limit to one result
        });
        programId = program.length > 0 ? program[0].id : null;
        if (!programId) {
          missingProgramRows.push(row.number);
        }
      } else {
        missingProgramRows.push(row.number);
      }

      let departmentId = null;
      if (rowData.department) {
        const department = await prisma.department.findMany({
          where: { name: rowData.department },
          take: 1, // Limit to one result
        });
        departmentId = department.length > 0 ? department[0].id : null;
        if (!departmentId) {
          missingDepartmentRows.push(row.number);
        }
      } else {
        missingDepartmentRows.push(row.number);
      }

      let termId = null;
      if (rowData.term) {
        const term = await prisma.semester.findMany({
          where: { name: rowData.term },
          take: 1, // Limit to one result
        });
        termId = term.length > 0 ? term[0].id : null;
        if (!termId) {
          missingTermRows.push(row.number);
        }
      } else {
        missingTermRows.push(row.number);
      }

      // Prepare error messages based on missing attributes

      // Assign the IDs to the another variable
      rowAcademicYearId = academicYearId;
      rowAdmissionYearId = admissionYearId;
      rowBatchYearId = batchYearId;
      rowProgramId = programId;
      rowDepartmentId = departmentId;
      rowTermId = termId;

      try {
        const passwordToHash = String(rowData.password);
        const hashedPassword = await hash(passwordToHash, 10);
        const validatedUser = userSchema.parse({
          username: rowData.username,
          email: rowData.email,
          password: hashedPassword,
          role: "STUDENT",
          collegeId,
          // departmentId,
        });
        // const validatedStudent = studentSchema.parse(rowData);
        const validatedStudent = studentSchema.parse({
          ...rowData,

          academicYearId: rowAcademicYearId,
          admissionYearId: rowAdmissionYearId,
          batchYearId: rowBatchYearId,
          programId: rowProgramId,
          departmentId: rowDepartmentId,
          termId: rowTermId,
          // userId: undefined, // User ID will be set after user creation
        });
        console.log("Validated Student", validatedStudent);

        jsonData.push({ user: validatedUser, student: validatedStudent });

        console.log("JSON Data", jsonData);
        // jsonData.push({ ...validatedUser, ...validatedStudent });
      } catch (validationError) {
        console.error("Validation error:", validationError);
      }
    }

    if (missingEmailRows.length > 0) {
      return NextResponse.json(
        {
          error: "Missing email for specific rows",
          rows: missingEmailRows,
        },
        { status: 400 }
      );
    }
    if (missingPersonalEmailRows.length > 0) {
      return NextResponse.json(
        {
          error: "Missing personal email for specific rows",
          rows: missingPersonalEmailRows,
        },
        { status: 400 }
      );
    }

    emailMap.forEach((rows, email) => {
      if (rows.length > 1) {
        duplicateEmailsInFile.push({ email, rows });
      }
    });

    // Populate duplicate email and personalEmail information
    for (const [personalEmail, rows] of personalEmailMap) {
      if (rows.length > 1) {
        duplicatePersonalEmailsInFile.push({ personalEmail, rows });
      }
    }

    if (duplicateEmailsInFile.length > 0) {
      return NextResponse.json(
        {
          error: "Duplicate emails detected in the uploaded file",
          duplicates: duplicateEmailsInFile,
        },
        { status: 400 }
      );
    }

    if (duplicatePersonalEmailsInFile.length > 0) {
      return NextResponse.json(
        {
          error: "Duplicate personal emails detected in the uploaded file",
          duplicates: duplicatePersonalEmailsInFile,
        },
        { status: 400 }
      );
    }

    // Now check for existing emails in the database
    const emailList = Array.from(emailMap.keys());
    console.log("EmailList:", emailList);
    const existingUsers = await prisma.user.findMany({
      where: {
        email: {
          in: emailList,
        },
      },
      select: {
        email: true,
      },
    });
    console.log("ExistingUsers:", existingUsers);

    existingEmails.push(...existingUsers.map((user) => user.email)); // Collect existing emails
    console.log("ExistingEmails:", existingEmails);

    // Check against the database for existing personalEmails
    const uniquePersonalEmails = Array.from(personalEmailMap.keys());
    const dbPersonalEmails = await prisma.student.findMany({
      where: { personalEmail: { in: uniquePersonalEmails } },
      select: { personalEmail: true },
    });

    // for (const dbEntry of dbPersonalEmails) {
    //   existingPersonalEmails.push(dbEntry.personalEmail);
    // }
    existingPersonalEmails.push(
      ...dbPersonalEmails.map((entry) => entry.personalEmail)
    );
    console.log("ExistingPersonalEmails:", existingPersonalEmails);

    // const duplicates = [];
    // for (const email of existingEmails) {
    //   if (emailMap.has(email)) {
    //     duplicates.push({
    //       email,
    //       rows: emailMap.get(email),
    //     });
    //   }
    // }
    // // Collect duplicates for personal emails
    // for (const personalEmail of existingPersonalEmails) {
    //   if (personalEmailMap.has(personalEmail)) {
    //     duplicates.push({
    //       personalEmail,
    //       rows: personalEmailMap.get(personalEmail),
    //     });
    //   }
    // }

    const emailDuplicates = [];
    const personalEmailDuplicates = [];

    // Collect duplicates for emails
    for (const email of existingEmails) {
      if (emailMap.has(email)) {
        emailDuplicates.push({
          email,
          rows: emailMap.get(email),
        });
      }
    }

    // Collect duplicates for personal emails
    for (const personalEmail of existingPersonalEmails) {
      if (personalEmailMap.has(personalEmail)) {
        personalEmailDuplicates.push({
          personalEmail,
          rows: personalEmailMap.get(personalEmail),
        });
      }
    }

    // If duplicates are found, return them
    if (emailDuplicates.length > 0) {
      return NextResponse.json(
        {
          error: "Emails already exist in the system",
          emailDuplicates,
        },
        { status: 400 }
      );
    }

    // If personal email duplicates are found, return them
    if (personalEmailDuplicates.length > 0) {
      return NextResponse.json(
        {
          error: "Emails already exist in the system",
          personalEmailDuplicates,
        },
        { status: 400 }
      );
    }

    if (missingAcademicYearRows.length > 0) {
      errorMessages.push(
        `Academic Year missing or invalid in rows: ${missingAcademicYearRows.join(
          ", "
        )}`
      );
    }
    if (missingAdmissionYearRows.length > 0) {
      errorMessages.push(
        `Admission Year missing or invalid in rows: ${missingAdmissionYearRows.join(
          ", "
        )}`
      );
    }
    if (missingBatchYearRows.length > 0) {
      errorMessages.push(
        `Batch Year missing or invalid in rows: ${missingBatchYearRows.join(
          ", "
        )}`
      );
    }
    if (missingProgramRows.length > 0) {
      errorMessages.push(
        `Program missing or invalid in rows: ${missingProgramRows.join(", ")}`
      );
    }
    if (missingDepartmentRows.length > 0) {
      errorMessages.push(
        `Department missing or invalid in rows: ${missingDepartmentRows.join(
          ", "
        )}`
      );
    }
    if (missingTermRows.length > 0) {
      errorMessages.push(
        `Term missing or invalid in rows: ${missingTermRows.join(", ")}`
      );
    }
    // If there are any error messages, return them as a response
    if (errorMessages.length > 0) {
      return NextResponse.json(
        {
          errors: errorMessages,
        },
        { status: 400 }
      );
    }

    // return NextResponse.json({
    //   message: "Data extracted and validated successfully",
    //   data: jsonData,
    // });

    // Prepare for batch insertions
    const createUserAndStudentPromises = jsonData.map(({ user, student }) => {
      return prisma.$transaction(async (prisma) => {
        const newUser = await prisma.user.create({
          data: user,
        });
        console.log("userId", newUser.id);

        // Create corresponding student record
        await prisma.student.create({
          data: {
            // ...student,

            name: student.name,
            enrollmentNo: student.enrollmentNo,
            dob: student.dob,
            personalEmail: student.personalEmail,
            phoneNo: student.phoneNo,
            studentAvatar: student.studentAvatar,
            abcId: student.abcId,
            lastCollegeAttended: student.lastCollegeAttended,
            gender: student.gender,
            isLocalStudent: student.isLocalStudent,
            isDifferentlyAbled: student.isDifferentlyAbled,
            motherName: student.motherName,
            fatherName: student.fatherName,
            bloodGroup: student.bloodGroup,
            religion: student.religion,
            nationality: student.nationality,
            caste: student.caste,
            admissionCategory: student.admissionCategory,
            resident: student.resident,
            admissionDate: student.admissionDate,
            graduateDate: student.graduateDate,
            permanentAddress: student.permanentAddress,
            permanentCountry: student.permanentCountry,
            permanentState: student.permanentState,
            permanentCity: student.permanentCity,
            permanentPincode: student.permanentPincode,
            guardianName: student.guardianName,
            guardianGender: student.guardianGender,
            guardianEmail: student.guardianEmail,
            guardianMobileNo: student.guardianMobileNo,
            guardianRelation: student.guardianRelation,
            user: { connect: { id: newUser.id } }, // Link the new user to the student record
            batchYear: { connect: { id: student.batchYearId } },
            admissionYear: { connect: { id: student.admissionYearId } },
            academicYear: { connect: { id: student.academicYearId } },
            term: { connect: { id: student.termId } },
            program: { connect: { id: student.programId } },
            department: { connect: { id: student.departmentId } },
            college: { connect: { id: collegeId } },
          },
        });
      });
    });

    await Promise.all(createUserAndStudentPromises);

    return NextResponse.json(
      { message: "Students created successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in processing the uploaded file:", error);
    return NextResponse.json(
      { error: "Failed to process the uploaded file" },
      { status: 500 }
    );
  }
}
