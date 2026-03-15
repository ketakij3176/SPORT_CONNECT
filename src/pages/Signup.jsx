import React, { useState } from "react"
import { supabase } from "../supabaseClient"
import { useNavigate, Link } from "react-router-dom"

export default function Signup(){
  const [username,setUsername] = useState("")
  const [password,setPassword] = useState("")
  const [role,setRole] = useState("player")

  const navigate = useNavigate()

  const handleSignup = async () => {
    if(!username || !password){
      alert("Fill all fields")
      return
    }

    const { data:existing } = await supabase
      .from("users")
      .select("*")
      .eq("username",username)

    if(existing.length > 0){
      alert("Username already exists")
      return
    }

    const { error } = await supabase
      .from("users")
      .insert([
        {
          username,
          password,
          role
        }
      ])

    if(error){
      alert("Signup failed")
      return
    }

    alert("Account created")
    navigate("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5E9E2] px-4">
      <div className="w-full max-w-md bg-[#FFF8F4] rounded-2xl shadow-lg px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-wide text-[#800020]">
            Create account
          </h2>
          <div className="text-xs text-[#5b3a3a] flex items-center gap-1">
            <span className="font-semibold">Role</span>
            <select
              value={role}
              onChange={(e)=>setRole(e.target.value)}
              className="rounded-full border border-[#e0cfc5] bg-white px-3 py-1 text-xs outline-none focus:border-[#800020] focus:ring-1 focus:ring-[#80002044]"
            >
              <option value="player">Player</option>
              <option value="coach">Coach</option>
              <option value="ground_owner">Ground Owner</option>
              <option value="equipment_owner">Equipment Owner</option>
              <option value="club">Club</option>
              <option value="resource">Resource</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#5b3a3a] mb-1">
              Username
            </label>
            <input
              className="w-full rounded-full border border-[#e0cfc5] bg-white py-2.5 px-3 text-sm outline-none shadow-sm focus:border-[#800020] focus:ring-2 focus:ring-[#80002022] transition"
              placeholder="Choose a username"
              value={username}
              onChange={(e)=>setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#5b3a3a] mb-1">
              Password
            </label>
            <input
              className="w-full rounded-full border border-[#e0cfc5] bg-white py-2.5 px-3 text-sm outline-none shadow-sm focus:border-[#800020] focus:ring-2 focus:ring-[#80002022] transition"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={handleSignup}
            className="w-full mt-2 rounded-full bg-[#800020] text-white py-2.5 text-sm font-medium shadow-md hover:bg-[#5f0018] hover:shadow-lg transition"
          >
            Sign up
          </button>
        </div>

        <p className="mt-6 text-xs text-center text-[#7b5b5b]">
          Already have an account?{" "}
          <Link to="/" className="text-[#800020] font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}