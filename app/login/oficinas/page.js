"use client";

import { useEffect,useState } from "react";
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

<div className="p-10">

<h1 className="text-2xl mb-5">
Oficinas
</h1>

<div className="flex gap-3 mb-6">

<input
className="border p-2"
placeholder="Nombre"
value={name}
onChange={(e)=>setName(e.target.value)}
/>

<input
className="border p-2"
placeholder="Ciudad"
value={city}
onChange={(e)=>setCity(e.target.value)}
/>

<button
onClick={createOffice}
className="bg-blue-600 text-white px-4"
>

Crear

</button>

</div>

{offices.map(o=>(

<div
key={o._id}
className="border p-3 mb-2"
>

{o.name} - {o.city}

</div>

))}

</div>

);

}