'use client'

import { Button, Input, message, Select } from "antd"
import axios from "axios";
import { useEffect, useState } from "react"
import { useUserStore } from "../../store/useUserStore";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter()
  const [messageApi, contextHolder] = message.useMessage();

  const Notify = (type, content) => {
    messageApi.open({
      type: type,
      content: content,
    });
  }

  const [loginData, setLoginData] = useState({ userID: "", password: "", role: "" });

  const { user, isUser, setUser, setIsUser } = useUserStore();

  const handleLogin = () => {
    if (!loginData.userID) {
      Notify('error', "User Id Required")
      return
    }
    if (!loginData.password) {
      Notify('error', "Password Is Required")
      return
    }
    if (!loginData.role) {
      Notify('error', "Role Is Required")
      return
    }
    if (loginData.role == 'admin')
      axios.post('http://localhost:8000/admin/login', { userID: loginData.userID, password: loginData.password }, { withCredentials: true }).then(data => {
        if (data.data.success) {
          setUser(data.user)
          setIsUser(true)
          router.push('/admin')
        }
        else {
          Notify('info', data.data.message)
        }
      }).catch(err => {
        Notify('info', err.message)
      })
      else{
        axios.post('http://localhost:8000/student/login', { userID: loginData.userID, password: loginData.password }, { withCredentials: true }).then(data => {
        if (data.data.success) {
          setUser(data.user)
          setIsUser(true)
          router.push('/student')
        }
        else {
          Notify('info', data.data.message)
        }
      }).catch(err => {
        Notify('info', err.message)
      })
      }
  }

  useEffect(() => {
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

  return (
    <main className="flex w-screen h-screen flex-col items-center justify-center relative ">
      {contextHolder}
      <img src="./bg.jpeg" className='w-full h-full object-cover absolute' alt="" />
      <div className="bg-overlay w-full h-full absolute bg-black/50"></div>

      <div className="content flex items-center justify-center flex-col p-8 z-50 border-2 border-white/30 rounded-xl max-w-[90vw] min-w-[280px] gap-4">
        <div className="Login font-semibold text-xl">Login</div>
        <Select
          placeholder="Select a Role"
          size="large"
          className="bg-white/30 text-white placeholder:text-white min-w-[250px] w-[85%]"
          optionFilterProp="children"
          onChange={e => { setLoginData({ ...loginData, role: e }) }}
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
        <Input size="large" value={loginData.userID} placeholder="User Id" className="bg-white/30 text-white placeholder:text-white min-w-[250px] w-[85%]" onChange={e => setLoginData({ ...loginData, userID: e.target.value })}></Input>
        <Input size="large" value={loginData.password} placeholder="Password" className="bg-white/30 text-white placeholder:text-white min-w-[250px] w-[85%]" onChange={e => setLoginData({ ...loginData, password: e.target.value })}></Input>
        <Button size="large" onClick={handleLogin} className="bg-blue-500 ">Login</Button>
      </div>
    </main>
  )
}
