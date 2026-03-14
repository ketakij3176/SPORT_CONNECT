"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function Test(){

useEffect(()=>{

async function check(){

const { data, error } = await supabase.auth.getSession()

console.log(data, error)

}

check()

},[])

return(

<div style={{padding:"40px"}}>

<h1>Supabase Test</h1>
<p>Open Console (F12)</p>

</div>

)

}