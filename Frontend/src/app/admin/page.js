'use client'

import React, { useEffect, useState } from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { Button, message, Modal, Table, Input, Select } from 'antd';
import axios from 'axios';
import { useRouter } from "next/navigation";
import { useUserStore } from "../../store/useUserStore";
import Cookies from 'js-cookie';
import fileDownload from 'js-file-download';

const page = () => {
  const router = useRouter()
  const [students, setStudents] = useState([])
  const [addStudent, setAddStudent] = useState(false)
  const [loginData, setLoginData] = useState({ userID: "", password: "", role: "" });
  const [openVerify, setOpenVerify] = useState(false)
  const [openedStudent, setOpenedStudent] = useState('')

  const [messageApi, contextHolder] = message.useMessage();
  const { user, isUser, setUser, setIsUser } = useUserStore();

  const [files, setFiles] = useState({ img: null, tenth: null, twelve: null, residence: null, income: null, caste: null, adhara: null })


  const columns = [
    {
      title: 'Name',
      render: (_, data) => data.form.name
    },
    {
      title: 'Phone',
      render: (_, data) => data.form.phone
    },
    {
      title: 'Status',
      render: (_, data) => data.status
    },
    {
      title: 'Verify',
      render: (_, data) => <Button size='large' type='primary' className='bg-blue-600' onClick={e => handleOpenVerify(data)}>Verify</Button>,
    },
  ];


  const Notify = (type, content) => {
    messageApi.open({
      type: type,
      content: content,
    });
  }

  const handleOpenVerify = (student) => {
    console.log(student)
    axios.get(`http://localhost:8000/admin/get-document/${student._id}`, { withCredentials: true }).then(data => {
      setFiles(data.data)
      setOpenedStudent(student)
      setOpenVerify(true)
    }).catch(err => {
      console.log(err)
    })
  }

  const handleStudentCreation = () => {
    axios.post('http://localhost:8000/admin/add-user', { userID: loginData.userID, password: loginData.password }, { withCredentials: true }).then(data => {
      if (data.data.success) {
        Notify('success', data.data.message || data.message)
      }
      else {
        Notify('error', data.data.message || data.message)
      }
    }).catch(err => {
      console.log(err.message)
      Notify('error', err.message)
    })
  }

  const handleLogout = () => {
    Cookies.remove('JWT')
    setIsUser(false)
    setUser({})
    router.replace('/')
  }

  const handleVerify = () => {

  }

  useEffect(() => {
    if (isUser) router.replace('/')
  }, [])


  useEffect(() => {
    axios.get('http://localhost:8000/admin/all-students', { withCredentials: true }).then(data => {
      if (data.data.success) {
        setStudents(data.data.students)
        setAddStudent(false)
      }
      else {
        Notify('error', data.data.message || data.message)
      }
    }).catch(err => {
      console.log(err.message)
      Notify('error', err.message)
    })
  }, [])
  return (
    <div className='flex items-center w-full min-h-screen flex-col gap-10'>
      {contextHolder}


      <Modal open={addStudent} onCancel={() => setAddStudent(false)} footer="" centered className='flex items-center justify-center'>
        <div className="flex items-center justify-center flex-col gap-3">
          <div className="header font-bold text-lg">Add Student</div>
          <Input size="large" value={loginData.userID} placeholder="User Id" className="w-[85%]" onChange={e => setLoginData({ ...loginData, userID: e.target.value })}></Input>
          <Input size="large" value={loginData.password} placeholder="Password" className="w-[85%]" onChange={e => setLoginData({ ...loginData, password: e.target.value })}></Input>
          <Button size="large" onClick={handleStudentCreation} className="bg-blue-500 w-[85%]">Create</Button>
        </div>
      </Modal>

      <Modal open={openVerify} onCancel={() => setOpenVerify(false)} footer="" centered className='flex items-center justify-center'>
        <div className="flex items-center justify-center flex-col gap-3">
          <div className="header font-bold text-lg">Verify Documents</div>
          <div className="items">img: {openedStudent.applied} <Button onClick={() => { fileDownload(files.img, openedStudent.form.img) }}>Download</Button></div>
          <div className="items">tenth: {openedStudent.applied} <Button onClick={() => { fileDownload(files.tenth, openedStudent.form.tenth) }}>Download</Button></div>
          <div className="items">twelve: {openedStudent.applied} <Button onClick={() => { fileDownload(files.twelve, openedStudent.form.twelve) }}>Download</Button></div>
          <div className="items">residence: {openedStudent.applied} <Button onClick={() => { fileDownload(files.residence, openedStudent.form.residence) }}>Download</Button></div>
          <div className="items">income: {openedStudent.applied} <Button onClick={() => { fileDownload(files.income, openedStudent.form.income) }}>Download</Button></div>
          <div className="items">caste: {openedStudent.applied} <Button onClick={() => { fileDownload(files.caste, openedStudent.form.caste) }}>Download</Button></div>
          <div className="items">adhara: {openedStudent.applied} <Button onClick={() => { fileDownload(files.adhara, openedStudent.form.adhara) }}>Download</Button></div>


          <Select
          placeholder="Select a Role"
          size="large"
          className="bg-white/30 text-white placeholder:text-white min-w-[250px] w-[85%]"
          optionFilterProp="children"
          // onChange={e => { setLoginData({ ...loginData, role: e }) }}
          options={[
            {
              value: 'admin',
              label: 'admin',
            },
            {
              value: 'student',
              label: 'student',
            }
          ]}
        />
          <Button size="large" onClick={handleVerify} className="bg-blue-500 w-[85%]">Create</Button>
        </div>
      </Modal>

      <div className="header w-full flex items-center px-8 justify-between py-3">
        <div className="text font-semibold text-lg">Admin</div>
        <Button type='primary' size='large' danger onClick={handleLogout}>Log Out</Button>
      </div>
      <div className="add_student px-24 cursor-pointer py-8 rounded-2xl flex items-center justify-center bg-blue-500 border-1 border-white flex-col gap-3 mt-[5%]" onClick={() => setAddStudent(true)}>
        <PlusOutlined className='text-[50px]' />
        <div className="text text-sm">Add Students</div>
      </div>
      <div className="header w-full h-[50px] flex items-center justify-center font-semibold text-lg">Applied Students</div>
      <Table dataSource={students} columns={columns} />
    </div>
  )
}

export default page