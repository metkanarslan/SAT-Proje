import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import CreateProgram from "./pages/CreateProgram";
import EditProgram from "./pages/EditProgram";
import AddTeacher from "./pages/AddTeacher";
import TeacherList from "./pages/TeacherList";
import EditTeacher from "./pages/EditTeacher";
import AddCourse from "./pages/AddCourse";
import CourseList from "./pages/CourseList";
import EditCourse from "./pages/EditCourse";
import AddClass from "./pages/AddClass";
import ClassList from "./pages/ClassList";
import EditClass from "./pages/EditClass";
import AddDepartment from "./pages/AddDepartment";
import EditDepartment from "./pages/EditDepartment";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/program-olustur" element={<CreateProgram />} />
        <Route path="/edit-program/:bolumId" element={<EditProgram />} />
        <Route path="/add-teacher" element={<AddTeacher />} />
        <Route path="/teacher-list" element={<TeacherList />} />
        <Route path="/edit-teacher/:id" element={<EditTeacher />} />
        <Route path="/add-course" element={<AddCourse />} />
        <Route path="/course-list" element={<CourseList />} />
        <Route path="/edit-course/:id" element={<EditCourse />} />
        <Route path="/add-class" element={<AddClass />} />
        <Route path="/class-list" element={<ClassList />} />
        <Route path="/edit-class/:id" element={<EditClass />} />
        <Route path="/add-department" element={<AddDepartment />} />
        <Route path="/edit-department/:id" element={<EditDepartment />} />
      </Routes>
    </Router>
  );
}

export default App;
