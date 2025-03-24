"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { getSession } from "next-auth/react";

// Define the College type
type College = {
  id: string;
  name: string;
  address: string;
  establishedOn: string;
  websiteUrl: string;
  contactEmail: string;
  contactPhone: string;
  createdAt: string;
  updatedAt: string;
};

// Define the User type
type User = {
  id: string;
  username: string | null;
  email: string;
  password: string;
  role: "TEACHER" | "OTHER_ROLE"; // Extend roles if needed
  createdAt: string;
  updatedAt: string;
  collegeId: string;
  departmentId: string | null;
  college: College;
  department?: {
    name: string;
  } | null;
};

// Define the Teacher type
type Teacher = {
  id: string;
  userId: string;
  name: string | null;
  phoneNo: string | null;
  address: string | null;
  qualification: string;
  designation: string;
  experience: string | null;
  createdAt: string;
  updatedAt: string;
  user: User;
};

// Define the TeacherList type (Array of Teachers)
type TeacherList = Teacher[];

// Form data type for Subject creation
type FormData = {
  name: string;
  code: string;
  semester: string;
  creditScore: string;
  departmentId: string;
  teacherId: string;
};

const Subjects = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    code: "",
    semester: "",
    creditScore: "",
    departmentId: "",
    teacherId: "",
  });
  const [teachers, setTeachers] = useState<TeacherList>([]);
  const [loading, setLoading] = useState(true);

  // Fetch collegeId from session and then fetch teachers based on that collegeId
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        // Get session
        const session = await getSession();
        if (session && session.user.collegeId) {
          const collegeId = session.user.collegeId;
          const response = await fetch(`/api/teacher/college/${collegeId}`);

          if (response.ok) {
            const data = await response.json();
            setTeachers(data);
          } else {
            console.error("Failed to fetch teachers");
          }
        } else {
          console.error("No session or collegeId found");
        }
      } catch (error) {
        console.error("Error fetching teachers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      code: formData.code,
      semester: formData.semester,
      creditScore: parseFloat(formData.creditScore),
      departmentId: formData.departmentId,
      teacherId: formData.teacherId || null, // Optional field
    };

    try {
      const response = await fetch("/api/subjects", {
        method: "POST", // Change to 'PUT' if updating
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Handle success (e.g., show success message, clear form, etc.)
        alert("Subject created successfully");
      } else {
        alert("Failed to create subject");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="subject-form">
      <form onSubmit={handleSubmit} className="space-y-4 mx-40 mt-10">
        <div>
          <label htmlFor="name">Subject Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />
        </div>

        <div>
          <label htmlFor="code">Subject Code</label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />
        </div>

        <div>
          <label htmlFor="semester">Semester</label>
          <input
            type="text"
            name="semester"
            value={formData.semester}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />
        </div>

        <div>
          <label htmlFor="creditScore">Credit Score</label>
          <input
            type="number"
            name="creditScore"
            value={formData.creditScore}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />
        </div>

        <div>
          <label htmlFor="departmentId">Department ID</label>
          <input
            type="text"
            name="departmentId"
            value={formData.departmentId}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />
        </div>

        <div>
          <label htmlFor="teacherId">Teacher (Optional)</label>
          {loading ? (
            <p>Loading teachers...</p>
          ) : (
            <select
              name="teacherId"
              value={formData.teacherId}
              onChange={handleChange}
              className="border p-2 w-full"
            >
              <option value="">Select a teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.designation} - {teacher.user.department?.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2">
          Submit
        </button>
      </form>
    </div>
  );
};

export default Subjects;
