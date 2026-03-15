"use client";

import Link from "next/link";

export default function Sidebar(){

return(

<div style={{
width:"220px",
height:"100vh",
background:"#0f172a",
color:"white",
padding:"20px",
position:"fixed"
}}>

<h2>Gota a Gota</h2>

<br/>

<Link href="/dashboard">Dashboard</Link>

<br/><br/>

<Link href="/oficinas">Oficinas</Link>

<br/><br/>

<Link href="/login">Salir</Link>

</div>

);

}