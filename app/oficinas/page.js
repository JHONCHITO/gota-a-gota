"use client";

import { useState,useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { apiFetch } from "../../services/api";

export default function Oficinas(){

const [offices,setOffices]=useState([]);
const [name,setName]=useState("");
const [city,setCity]=useState("");

useEffect(()=>{

load();

},[]);

const load = async ()=>{

const data = await apiFetch("/api/offices");

setOffices(data);

};

const createOffice = async ()=>{

await apiFetch("/api/offices",{

method:"POST",
body:JSON.stringify({
name,
city
})

});

setName("");
setCity("");

load();

};

return(

<div>

<Sidebar/>

<div style={{marginLeft:"220px"}}>

<Header/>

<div style={{padding:"30px"}}>

<h1>Oficinas</h1>

<br/>

<input
placeholder="Nombre"
value={name}
onChange={(e)=>setName(e.target.value)}
/>

<input
placeholder="Ciudad"
value={city}
onChange={(e)=>setCity(e.target.value)}
/>

<button onClick={createOffice}>
Crear
</button>

<br/><br/>

{offices.map(o=>(

<div key={o._id}>
{o.name} - {o.city}
</div>

))}

</div>

</div>

</div>

);

}