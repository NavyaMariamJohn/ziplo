import { useState, useEffect } from "react";
import API from "../../utils/api";
import toast from "react-hot-toast";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isDisabled, setIsDisabled] = useState(() => {
  const savedTime = localStorage.getItem("resetTimer");
  return savedTime && parseInt(savedTime) > 0;
});
  const [timer, setTimer] = useState(() => {
  const savedTime = localStorage.getItem("resetTimer");
  return savedTime ? parseInt(savedTime) : 0;
});
  useEffect(() => {
  let interval;

  if (isDisabled && timer > 0) {
    interval = setInterval(() => {
      setTimer((prev) => {
        const newTime = prev - 1;
        localStorage.setItem("resetTimer", newTime); // ✅ save
        return newTime;
      });
    }, 1000);
  }

  if (timer === 0 && isDisabled) {
    setIsDisabled(false);
    localStorage.removeItem("resetTimer"); // ✅ clear
  }

  return () => clearInterval(interval);
  }, [isDisabled, timer]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API}/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
         toast.success("Reset link sent 📩");

        setIsDisabled(true);   // disable button
        setTimer(900);        // 15 minutes (900 seconds)
        } else {
            toast.error(data.error || "Error");
     }

    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };
  const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

  return (
    <div className="auth-container">
      <div className="auth-right">
        <div className="auth-card">

          <h2>Forgot Password</h2>

          <form onSubmit={handleSubmit} className="auth-form">
            <input
              type="email"
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button 
  className="btn-primary full" 
  disabled={isDisabled}
>
  {isDisabled ? `Wait ${formatTime(timer)}` : "Send Reset Link"}
</button>
          </form>

        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;