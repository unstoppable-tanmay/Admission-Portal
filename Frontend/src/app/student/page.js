'use client'

import React, { useEffect, useState } from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { Button, message, Modal, Table, Input, Select, Upload } from 'antd';
import axios from 'axios';
import { useRouter } from "next/navigation";
import { useUserStore } from "../../store/useUserStore";
import Cookies from 'js-cookie';
import { UploadOutlined } from '@ant-design/icons';


const page = () => {
  const router = useRouter()

  const [formFill, setFormFill] = useState(false)
  const [formData, setFormData] = useState({ name: "", email: "", address: "", phone: "", bloodGroup: "", img: null, tenth: null, twelve: null, residence: null, income: null, caste: null, adhara: null });

  const [messageApi, contextHolder] = message.useMessage();
  const { user, isUser, setUser, setIsUser } = useUserStore();

  const Notify = (type, content) => {
    messageApi.open({
      type: type,
      content: content,
    });
  }

  console.log(user)

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      setFormData({
        ...formData,
        [name]: files[0], // Assuming only one file is allowed per input
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleLogout = () => {
    Cookies.remove('JWT')
    setIsUser(false)
    setUser({})
    router.replace('/')
  }

  useEffect(() => {
    if (isUser) router.replace('/')

      axios.get('http://localhost:8000/auth/', { withCredentials: true }).then(data => {
        if (data.data.success) {
          setUser(data.data.user)
          setIsUser(true)
          console.log(data)
          if (data.data.user.role == 'admin') {
            router.push('/admin')
          }
          else if (data.data.user.role == 'student') {
            router.push('/student')
          }
        }
        else {
          Notify('error', data.data.message || data.message)
        }
      }).catch(err => {
        console.log(err.message)
        Notify('error', err.message)
      })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(formData)
    // Check for empty fields
    const emptyFields = Object.keys(formData).filter((field) => {
      const value = formData[field];
      return !value || (value instanceof File && !value.name);
    });

    if (emptyFields.length > 0) {
      alert(`Please fill in all fields, including file inputs.`);
      return;
    }

    const data = new FormData();

    // Append non-file fields to FormData
    Object.keys(formData).forEach((key) => {
      if (formData[key] instanceof File) {
        data.append(key, formData[key]);
      } else {
        data.append(key, formData[key]);
      }
    });

    try {
      axios.post('http://localhost:8000/student/submit-form', data, { withCredentials: true }).then(data => {
        setUser(data.data.user)
        setFormFill(false)
      }).catch(err => {
        Notify('error', err.message)
      })
    } catch (error) {
      Notify('error', error.message)
    }
  }


  return (
    <div className='flex items-center w-full min-h-screen flex-col gap-10'>
      {contextHolder}


      <Modal open={formFill} onCancel={() => setFormFill(false)} footer="" centered className='flex items-center justify-center'>
        <div className="flex items-center justify-center flex-col gap-3">
          <div className="header font-bold text-lg">Form</div>
          <Input name='name' size="large" value={formData.name} placeholder="Name" className="w-[85%]" onChange={handleChange}></Input>
          <Input name='email' size="large" value={formData.email} placeholder="Email" className="w-[85%]" onChange={handleChange}></Input>
          <Input name='phone' size="large" value={formData.phone} placeholder="Phone" className="w-[85%]" onChange={handleChange}></Input>
          <Input name='address' size="large" value={formData.address} placeholder="Address" className="w-[85%]" onChange={handleChange}></Input>
          <Select
            placeholder="Select a BloodGroup"
            size="large"
            className=" w-[85%]"
            optionFilterProp="children"
            onChange={e => { setFormData({ ...formData, bloodGroup: e }) }}
            options={["O+", "O-", "AB+", "AB-", "A+", "A-", "B+", "B-"].map(ele => {
              return {
                value: ele,
                label: ele,
              }
            })}
          />
          <div className="file_upload flex items-center justify-start w-[85%] gap-2">
            Passport Image:{'     '}
            <input type="file" name="img" id="" onChange={handleChange} />
          </div>
          <div className="file_upload flex items-center justify-start w-[85%] gap-2">
            10th Certificate:{'     '}
            <input type="file" name="tenth" id="" onChange={handleChange} />
          </div>
          <div className="file_upload flex items-center justify-start w-[85%] gap-2">
            12th Certificate:{'     '}
            <input type="file" name="twelve" id="" onChange={handleChange} />
          </div>
          <div className="file_upload flex items-center justify-start w-[85%] gap-2">
            Residence Certificate:{'     '}
            <input type="file" name="residence" id="" onChange={handleChange} />
          </div>
          <div className="file_upload flex items-center justify-start w-[85%] gap-2">
            Caste Certificate:{'     '}
            <input type="file" name="caste" id="" onChange={handleChange} />
          </div>
          <div className="file_upload flex items-center justify-start w-[85%] gap-2">
            Income Certificate:{'     '}
            <input type="file" name="income" id="" onChange={handleChange} />
          </div>
          <div className="file_upload flex items-center justify-start w-[85%] gap-2">
            Adhara:{'     '}
            <input type="file" name="adhara" id="" onChange={handleChange} />
          </div>
          <Button size="large" onClick={handleSubmit} className="bg-blue-500 w-[85%]">Submit</Button>
        </div>
      </Modal>

      <div className="header w-full flex items-center px-8 justify-between py-3">
        <div className="text font-semibold text-lg">Student</div>
        <Button type='primary' size='large' danger onClick={handleLogout}>Log Out</Button>
      </div>
      {user.applied ? <div className="flex">Your Status Of Application: {user.status}</div> : <div className="add_student px-24 cursor-pointer py-8 rounded-2xl flex items-center justify-center bg-blue-500 border-1 border-white flex-col gap-3 mt-[10%]" onClick={() => setFormFill(true)}>
        <div className="text text-xl">Apply</div>
      </div>}
    </div>
  )
}

export default page