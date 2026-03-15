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

<div>Total Oficinas</div>

<div>Total Clientes</div>

<div>Total Cobradores</div>

<div>Cartera Total</div>

</div>

</div>

</div>

);

}