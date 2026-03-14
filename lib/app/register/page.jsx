"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function Register(){

const router = useRouter()

const [email,setEmail] = useState("")
const [password,setPassword] = useState("")

const handleSignup = async(e)=>{

e.preventDefault()

const { error } = await supabase.auth.signUp({
 email,
 password
})

if(error){
 alert(error.message)
}
else{
 alert("Account created!")
 router.push("/login")
}

}

return(

<div style={{padding:"40px"}}>

<h1>Register</h1>

<form onSubmit={handleSignup}>

<input
type="email"
placeholder="Email"
onChange={(e)=>setEmail(e.target.value)}
/>

<br/>

<input
type="password"
placeholder="Password"
onChange={(e)=>setPassword(e.target.value)}
/>

<br/>

<button type="submit">
Register
</button>

</form>

</div>

)

}