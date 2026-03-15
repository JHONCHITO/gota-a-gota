"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Animación de billetes
  const [bills, setBills] = useState([]);
  const billImages = [
    "/images/billete1.png",
    "/images/billete2.png",
    "/images/billete3.png",
  ];

  useEffect(() => {
    // Crear 20 billetes aleatorios
    const newBills = Array.from({ length: 20 }, () => ({
      left: Math.random() * 100 + "%",
      size: Math.random() * 50 + 30 + "px",
      delay: Math.random() * 5 + "s",
      duration: Math.random() * 5 + 5 + "s",
      img: billImages[Math.floor(Math.random() * billImages.length)],
      rotate: Math.random() * 360 + "deg",
    }));
    setBills(newBills);
  }, []);

  const login = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();
      if (data.token) {
        localStorage.setItem("admin_token", data.token);
        router.push("/dashboard");
      } else {
        alert(data.message || "Usuario o contraseña incorrectos");
      }
    } catch (error) {
      console.error(error);
      alert("Error al conectar con el servidor");
    }
  };

  return (
    <div
      style={{
        position: "relative",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        fontFamily: "Arial, sans-serif",
        backgroundImage: `
          linear-gradient(rgba(0,119,182,0.6), rgba(0,119,182,0.6)),
          url('/images/fondo-login.jpg')
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Billetes cayendo */}
      {bills.map((bill, index) => (
        <img
          key={index}
          src={bill.img}
          style={{
            position: "absolute",
            top: "-60px",
            left: bill.left,
            width: bill.size,
            height: "auto",
            transform: `rotate(${bill.rotate})`,
            animation: `fall ${bill.duration} linear ${bill.delay} infinite`,
            zIndex: 5,
          }}
        />
      ))}

      {/* Caja de login */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <div
          style={{
            width: "400px",
            padding: "50px 40px",
            background: "rgba(255,255,255,0.95)",
            borderRadius: "20px",
            boxShadow: "0 15px 35px rgba(0,0,0,0.35)",
            textAlign: "center",
            backdropFilter: "blur(5px)",
          }}
        >
          <h1
            style={{
              color: "#0077b6",
              marginBottom: "40px",
              fontSize: "28px",
              fontWeight: "bold",
            }}
          >
            Gota a Gota - Super Admin
          </h1>

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "18px",
              marginBottom: "20px",
              borderRadius: "12px",
              border: "1px solid #ccc",
              fontSize: "16px",
              textAlign: "center",
              boxShadow: "inset 0 2px 5px rgba(0,0,0,0.1)",
              transition: "all 0.3s ease",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#0077b6";
              e.target.style.boxShadow = "0 0 8px rgba(0,119,182,0.5)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#ccc";
              e.target.style.boxShadow = "inset 0 2px 5px rgba(0,0,0,0.1)";
            }}
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "18px",
              marginBottom: "30px",
              borderRadius: "12px",
              border: "1px solid #ccc",
              fontSize: "16px",
              textAlign: "center",
              boxShadow: "inset 0 2px 5px rgba(0,0,0,0.1)",
              transition: "all 0.3s ease",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#0077b6";
              e.target.style.boxShadow = "0 0 8px rgba(0,119,182,0.5)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#ccc";
              e.target.style.boxShadow = "inset 0 2px 5px rgba(0,0,0,0.1)";
            }}
          />

          <button
            onClick={login}
            style={{
              width: "100%",
              padding: "18px",
              background: "linear-gradient(90deg, #6a11cb, #2575fc)",
              color: "#fff",
              fontSize: "18px",
              fontWeight: "bold",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.05)";
              e.target.style.boxShadow = "0 8px 20px rgba(0,0,0,0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "0 5px 15px rgba(0,0,0,0.2)";
            }}
          >
            Entrar
          </button>

          <p
            style={{
              marginTop: "20px",
              color: "#555",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            ¿Olvidaste tu contraseña?
          </p>
        </div>
      </div>

      {/* Animación de caída */}
      <style jsx>{`
        @keyframes fall {
          0% {
            top: -60px;
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}