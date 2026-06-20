import { auth, signIn, signOut } from "@/auth"
import ChatAgenda from "@/components/ChatAgenda"

export default async function Home() {
  const session = await auth()

  if (!session) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "20px",
            background: "linear-gradient(135deg, #007aff, #5ac8fa)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
            marginBottom: "1.25rem",
            boxShadow: "0 8px 24px rgba(0,122,255,0.25)",
          }}
        >
          🗓️
        </div>
        <h1
          style={{
            fontSize: "1.6rem",
            fontWeight: 700,
            margin: "0 0 0.4rem 0",
            textAlign: "center",
          }}
        >
          Nuestra Agenda
        </h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem", textAlign: "center", fontSize: "0.95rem" }}>
          Inicia sesión para empezar
        </p>
        <form
          action={async () => {
            "use server"
            await signIn("google")
          }}
        >
          <button
            type="submit"
            style={{
              padding: "0.85rem 2rem",
              fontSize: "1rem",
              fontWeight: 600,
              backgroundColor: "var(--accent)",
              color: "#ffffff",
              border: "none",
              borderRadius: "14px",
              boxShadow: "0 4px 14px rgba(0,122,255,0.3)",
            }}
          >
            Iniciar sesión con Google
          </button>
        </form>
      </div>
    )
  }

  const nombre = session.user.name.split(" ")[0]

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "1.25rem 1rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "600px" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.25rem",
            padding: "0 0.25rem",
          }}
        >
          <div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0 0 0.1rem 0" }}>Hola,</p>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>{nombre} 👋</h1>
          </div>
          <form
            action={async () => {
              "use server"
              await signOut()
            }}
          >
            <button
              type="submit"
              style={{
                background: "var(--bg-card)",
                border: "none",
                color: "var(--accent)",
                padding: "0.5rem 1rem",
                borderRadius: "12px",
                fontSize: "0.85rem",
                fontWeight: 600,
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}
            >
              Salir
            </button>
          </form>
        </header>

        <ChatAgenda />
      </div>
    </div>
  )
}