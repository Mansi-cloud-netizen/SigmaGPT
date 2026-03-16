import "./AuthModal.css";
import { useState, useContext } from "react";
import { MyContext } from "./MyContext.jsx";

function AuthModal({ type, setType, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const { setUser } = useContext(MyContext);

  const handleSubmit = async () => {
    setError("");
    const endpoint = type === "signup" ? "/api/auth/signup" : "/api/auth/login";
    const body = type === "signup" ? { name, email, password } : { email, password };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Authentication failed");
        return;
      }

      localStorage.setItem("auth_token", data.token);
      setUser(data.user);
      onClose();
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    }
  };

  const handleGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/auth/google`;
  };

  return (
    <div className="authOverlay">
      <div className="authModal">

        <h2>{type === "signup" ? "Create an account" : "Welcome back"}</h2>

        {error && (
          <div className="errorMsg" style={{ color: "red", marginBottom: "10px" }}>
            {error}
          </div>
        )}

        <button className="authBtn google" onClick={handleGoogle}>
          <i className="fa-brands fa-google"></i>
          Continue with Google
        </button>

        <div className="divider">OR</div>

        {type === "signup" && (
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="authBtn email" onClick={handleSubmit}>
          {type === "signup" ? "Sign Up" : "Login"}
        </button>

        <p className="terms">
          By continuing, you agree to our Terms & Privacy Policy
        </p>

        {/* SWITCH LOGIN / SIGNUP */}
        <p style={{ marginTop: "12px", textAlign: "center" }}>
          {type === "signup" ? (
            <>
              Already have an account?{" "}
              <span
                style={{ color: "#4da6ff", cursor: "pointer", fontWeight: "500" }}
                onClick={() => setType("login")}
              >
                Login
              </span>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <span
                style={{ color: "#4da6ff", cursor: "pointer", fontWeight: "500" }}
                onClick={() => setType("signup")}
              >
                Sign Up
              </span>
            </>
          )}
        </p>

      </div>
    </div>
  );
}

export default AuthModal;