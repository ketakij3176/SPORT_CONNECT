import React,{useState} from "react"
import { supabase } from "../supabaseClient"
import { useNavigate,Link } from "react-router-dom"

export default function Signup(){

const [username,setUsername] = useState("")
const [password,setPassword] = useState("")
const [role,setRole] = useState("")
const navigate = useNavigate()

const handleSignup = async () => {

const { error } = await supabase
.from("users")
.insert([
{
username:username,
password:password,
role:role
}
])

if(error){
alert(error.message)
return
}

alert("Account Created")

navigate("/")

}

return(

<div style={styles.container}>

<div style={styles.card}>

<h2 style={styles.title}><b>Create Account</b></h2>

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

<select
style={styles.input}
onChange={(e)=>setRole(e.target.value)}
>

<option>Select Role</option>
<option>Player</option>
<option>Club</option>
<option>Coach</option>
<option>Tournament Organizer</option>
<option>Ground Owner</option>
<option>Equipment Resources</option>

</select>

<button style={styles.button} onClick={handleSignup}>
Sign Up
</button>

<p style={styles.text}>
Already have an account?
<Link to="/" style={styles.link}> Login</Link>
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