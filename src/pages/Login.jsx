import React, { useState } from "react"
import { supabase } from "../supabaseClient"
import { useNavigate, Link } from "react-router-dom"

export default function Login(){

const [username,setUsername] = useState("")
const [password,setPassword] = useState("")
const navigate = useNavigate()

const handleLogin = async () => {

const { data,error } = await supabase
.from("users")
.select("*")
.eq("username",username)
.eq("password",password)

if(error || data.length === 0){
alert("Invalid username or password")
return
}

navigate("/main")

}

return(

<div style={styles.container}>

<div style={styles.card}>

<h2 style={styles.title}>SPORT CONNECT</h2>

<input
style={styles.input}
placeholder="Username"
onChange={(e)=>setUsername(e.target.value)}
/>

<input
style={styles.input}
type="password"
placeholder="Password"
onChange={(e)=>setPassword(e.target.value)}
/>

<button style={styles.button} onClick={handleLogin}>
Login
</button>

<p style={styles.text}>
Don't have an account?
<Link to="/signup" style={styles.link}> Sign up</Link>
</p>

</div>

</div>

)

}

const styles={

container:{
display:"flex",
justifyContent:"center",
alignItems:"center",
height:"100vh",
background:"#F5E9E2"
},

card:{
background:"#FFF8F4",
padding:"40px",
borderRadius:"12px",
width:"350px",
boxShadow:"0 6px 18px rgba(0,0,0,0.1)",
textAlign:"center"
},

title:{
color:"#800020",
marginBottom:"20px"
},

input:{
width:"100%",
padding:"12px",
marginTop:"10px",
border:"1px solid #ccc",
borderRadius:"6px"
},

button:{
marginTop:"20px",
width:"100%",
padding:"12px",
background:"#800020",
color:"white",
border:"none",
borderRadius:"6px",
cursor:"pointer"
},

text:{
marginTop:"15px"
},

link:{
color:"#800020",
fontWeight:"bold"
}

}