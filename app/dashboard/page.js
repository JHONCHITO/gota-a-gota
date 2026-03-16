"use client";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

export default function Dashboard(){

return(

<div>

<Sidebar/>

<div style={{marginLeft:"220px"}}>

<Header/>

<div style={{padding:"30px"}}>

<h1>Dashboard Super Admin</h1>

<br/>
  <div style={{display: "flex", gap: "20px", marginBottom: "40px"}}><button onClick={() => window.location.href = "/oficinas"} style={{padding: "15px 30px", fontSize: "16px", fontWeight: "bold", background: "linear-gradient(90deg, #6a11cb, #2575fc)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer"}}>Crear Oficinas</button><button onClick={() => window.location.href = "/panel-gota"} style={{padding: "15px 30px", fontSize: "16px", fontWeight: "bold", background: "linear-gradient(90deg, #11998e, #38ef7d)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer"}}>Panel Gota a Gota</button></div>

<div>Total Oficinas</div>

<div>Total Clientes</div>

<div>Total Cobradores</div>

<div>Cartera Total</div>

</div>

</div>

</div>

);

}
