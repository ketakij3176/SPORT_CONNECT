"use client"

import { useState } from "react"
import { supabase } from "../../lib/supabaseClient"

export default function Register(){

const [email,setEmail] = useState("")
const [password,setPassword] = useState("")

async function handleSignup(e){
e.preventDefault()

const { error } = await supabase.auth.signUp({
email,
password
})

if(error){
alert(error.message)
}else{
alert("Account created")
}

}

return(

<div style={{padding:"40px"}}>

<h1>Create Account</h1>

<form onSubmit={handleSignup}>

<input
type="email"
placeholder="Email"
onChange={(e)=>setEmail(e.target.value)}
/>

<br/><br/>

<input
type="password"
placeholder="Password"
onChange={(e)=>setPassword(e.target.value)}
/>

<br/><br/>

<button type="submit">
Register
</button>

</form>

</div>

)

}