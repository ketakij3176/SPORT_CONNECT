import React, { useState } from "react"
import { supabase } from "../supabaseClient"
import { useNavigate, Link } from "react-router-dom"
import { Mail, Lock } from "lucide-react"

export default function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleLogin = async () => {
    setError("")

    if (!username || !password) {
      setError("Please enter both username/email and password.")
      return
    }

    const { data, error: dbError } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .eq("password", password)

    if (dbError || !data || data.length === 0) {
      setError("Invalid username or password.")
      return
    }

    localStorage.setItem("user", JSON.stringify(data[0]))
    navigate("/landing")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5E9E2] px-4">
      <div className="w-full max-w-md bg-[#FFF8F4] rounded-2xl shadow-lg px-8 py-10">
        <h2 className="text-2xl font-bold tracking-wide text-[#800020] text-center mb-6">
          SPORT CONNECT
        </h2>

        <p className="text-sm text-[#704242] text-center mb-6">
          Login to discover grounds, tournaments and players around you.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#5b3a3a] mb-1">
              Email or Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-[#b28b7b]">
                <Mail className="w-4 h-4" />
              </span>
              <input
                className="w-full rounded-full border border-[#e0cfc5] bg-white py-2.5 pl-9 pr-3 text-sm outline-none shadow-sm focus:border-[#800020] focus:ring-2 focus:ring-[#80002022] transition"
                placeholder="Enter your email or username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#5b3a3a] mb-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-[#b28b7b]">
                <Lock className="w-4 h-4" />
              </span>
              <input
                className="w-full rounded-full border border-[#e0cfc5] bg-white py-2.5 pl-9 pr-3 text-sm outline-none shadow-sm focus:border-[#800020] focus:ring-2 focus:ring-[#80002022] transition"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="mt-1 text-right">
              <button
                type="button"
                className="text-xs text-[#800020] hover:underline"
              >
                Forgot password?
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleLogin}
            className="w-full mt-2 rounded-full bg-[#800020] text-white py-2.5 text-sm font-medium shadow-md hover:bg-[#5f0018] hover:shadow-lg transition"
          >
            Login
          </button>
        </div>

        <p className="mt-6 text-xs text-center text-[#7b5b5b]">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-[#800020] font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}