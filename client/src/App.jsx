import { useState } from 'react';

import SignUp from './components/LoginSignup/signup';
import Login from './components/LoginSignup/login';
import Teacher from './components/LoginSignup/teacher-dashboard';
import Student from './components/LoginSignup/student-dashboard';
import Assignment from './components/LoginSignup/generate-assignment';
import {BrowserRouter, Routes, Route, Router} from 'react-router-dom';


function App() {

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/register' element={<SignUp />}></Route>
          <Route path='/login' element={<Login />}></Route>
          <Route path='/teacher-dashboard' element={<Teacher />}></Route>
          <Route path='/student' element={<Student />}></Route>
          <Route path='/assignment' element={<Assignment />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
