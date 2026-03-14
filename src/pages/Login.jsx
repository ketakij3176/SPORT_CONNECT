import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Login() {

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const signUp = async () => {

    const { error } = await supabase.auth.signUp({
      email: email,
      password: password
    });

    if(error){
      alert(error.message);
    } else {
      alert("Account created!");
    }
  };

  const login = async () => {

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if(error){
      alert(error.message);
    } else {
      alert("Login successful");
    }
  };

  return (

    <div style={{
      display:"flex",
      justifyContent:"center",
      alignItems:"center",
      height:"100vh"
    }}>

      <div style={{
        width:"350px",
        padding:"30px",
        background:"white",
        boxShadow:"0 0 10px rgba(0,0,0,0.1)",
        borderRadius:"10px"
      }}>

        <h2>SportConnect Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          style={{width:"100%",padding:"10px",marginTop:"10px"}}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          style={{width:"100%",padding:"10px",marginTop:"10px"}}
        />

        <button
          onClick={login}
          style={{width:"100%",marginTop:"15px",padding:"10px"}}
        >
          Login
        </button>

        <button
          onClick={signUp}
          style={{width:"100%",marginTop:"10px",padding:"10px"}}
        >
          Create Account
        </button>

      </div>

    </div>
  );
}