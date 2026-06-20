"use client";

import { useState, useRef, useEffect } from "react";

export default function ChatAgenda() {
  const [mensaje, setMensaje] = useState("");
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [pendiente, setPendiente] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [historial, cargando]);

  async function enviarMensaje(e) {
    e.preventDefault();
    if (!mensaje.trim()) return;

    const textoEnviado = mensaje;
    setMensaje("");
    setCargando(true);

    setHistorial((prev) => [...prev, { tipo: "usuario", texto: textoEnviado }]);

    try {
      const res = await fetch("/api/agendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje: textoEnviado, pendiente }),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        const fecha = new Date(data.fecha).toLocaleString("es-EC", {
          weekday: "long",
          day: "numeric",
          month: "long",
          hour: "numeric",
          minute: "2-digit",
        });
        setHistorial((prev) => [
          ...prev,
          { tipo: "ok", titulo: data.titulo, fecha },
        ]);
        setPendiente(null);
      } else if (data.necesitaFecha) {
        setHistorial((prev) => [
          ...prev,
          { tipo: "pregunta", texto: data.error },
        ]);
        setPendiente({ titulo: data.tituloPendiente });
      } else {
        setHistorial((prev) => [...prev, { tipo: "error", texto: data.error }]);
      }
    } catch (err) {
      setHistorial((prev) => [
        ...prev,
        { tipo: "error", texto: "Sin conexión. Intenta de nuevo." },
      ]);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div
      style={{
        backgroundColor: "var(--bg-card)",
        borderRadius: "20px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}
    >
      {/* Historial */}
      <div
        ref={scrollRef}
        style={{
          height: "440px",
          overflowY: "auto",
          padding: "1.25rem 1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
        }}
      >
        {historial.length === 0 && <EstadoVacio />}

        {historial.map((item, i) => (
          <Burbuja key={i} item={item} />
        ))}

        {cargando && (
          <div
            style={{
              alignSelf: "flex-start",
              display: "flex",
              gap: "4px",
              padding: "0.7rem 1rem",
            }}
          >
            <span className="punto" style={{ animationDelay: "0s" }} />
            <span className="punto" style={{ animationDelay: "0.15s" }} />
            <span className="punto" style={{ animationDelay: "0.3s" }} />
          </div>
        )}
      </div>

      {/* Pendiente */}
      {pendiente && (
        <div
          style={{
            padding: "0.55rem 1.1rem",
            backgroundColor: "var(--warn-soft)",
            fontSize: "0.8rem",
            color: "#b25f00",
            fontWeight: 500,
          }}
        >
          ⏳ Esperando fecha para &apos;{pendiente.titulo}&apos;
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={enviarMensaje}
        style={{
          display: "flex",
          gap: "0.5rem",
          padding: "0.75rem",
          borderTop: "1px solid var(--line)",
        }}
      >
        <input
          type="text"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          placeholder={
            pendiente ? "¿Para cuándo? ej: mañana a las 5pm" : "iMessage"
          }
          disabled={cargando}
          style={{
            flex: 1,
            backgroundColor: "var(--bg-base)",
            border: "1px solid var(--line)",
            borderRadius: "20px",
            padding: "0.65rem 1.1rem",
            color: "var(--text-primary)",
            fontSize: "0.95rem",
          }}
        />
        <button
          type="submit"
          disabled={cargando || !mensaje.trim()}
          style={{
            backgroundColor: mensaje.trim() ? "var(--accent)" : "var(--line)",
            color: "#ffffff",
            border: "none",
            borderRadius: "50%",
            width: "42px",
            height: "42px",
            fontSize: "1.1rem",
            flexShrink: 0,
            transition: "background-color 0.15s",
          }}
        >
          ↑
        </button>
      </form>

      <style jsx>{`
        .punto {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--text-muted);
          display: inline-block;
          animation: rebotar 1s infinite ease-in-out;
        }
        @keyframes rebotar {
          0%,
          80%,
          100% {
            opacity: 0.3;
            transform: translateY(0);
          }
          40% {
            opacity: 1;
            transform: translateY(-3px);
          }
        }
      `}</style>
    </div>
  );
}

function EstadoVacio() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "2.5rem 1rem",
        color: "var(--text-muted)",
      }}
    >
      <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>💬</div>
      <p
        style={{ fontSize: "0.9rem", margin: "0 0 0.25rem 0", fontWeight: 500 }}
      >
        Aún no hay nada agendado
      </p>
      <p style={{ fontSize: "0.8rem", margin: 0 }}>
        Escribe algo como &apos;comprar pan mañana a las 5pm&apos;
      </p>
    </div>
  );
}

function Burbuja({ item }) {
  if (item.tipo === "usuario") {
    return (
      <div
        style={{
          alignSelf: "flex-end",
          backgroundColor: "var(--bubble-mine)",
          color: "#ffffff",
          padding: "0.6rem 1rem",
          borderRadius: "18px",
          borderBottomRightRadius: "5px",
          maxWidth: "78%",
          fontSize: "0.95rem",
          lineHeight: 1.35,
        }}
      >
        {item.texto}
      </div>
    );
  }

  if (item.tipo === "ok") {
    return (
      <div
        style={{
          alignSelf: "flex-start",
          backgroundColor: "var(--success-soft)",
          padding: "0.65rem 1rem",
          borderRadius: "18px",
          borderBottomLeftRadius: "5px",
          maxWidth: "82%",
          display: "flex",
          gap: "0.6rem",
          alignItems: "flex-start",
        }}
      >
        <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>✅</span>
        <div>
          <div
            style={{ fontWeight: 600, fontSize: "0.95rem", color: "#1c1c1e" }}
          >
            {item.titulo}
          </div>
          <div
            style={{
              fontSize: "0.82rem",
              color: "#3a7a45",
              marginTop: "0.1rem",
            }}
          >
            {item.fecha}
          </div>
        </div>
      </div>
    );
  }

  if (item.tipo === "pregunta") {
    return (
      <div
        style={{
          alignSelf: "flex-start",
          backgroundColor: "var(--bubble-system)",
          color: "var(--text-primary)",
          padding: "0.6rem 1rem",
          borderRadius: "18px",
          borderBottomLeftRadius: "5px",
          maxWidth: "82%",
          fontSize: "0.95rem",
        }}
      >
        {item.texto}
      </div>
    );
  }

  // error
  return (
    <div
      style={{
        alignSelf: "flex-start",
        backgroundColor: "var(--error-soft)",
        color: "#b3261e",
        padding: "0.6rem 1rem",
        borderRadius: "18px",
        borderBottomLeftRadius: "5px",
        maxWidth: "82%",
        fontSize: "0.95rem",
      }}
    >
      ⚠️ {item.texto}
    </div>
  );
}
