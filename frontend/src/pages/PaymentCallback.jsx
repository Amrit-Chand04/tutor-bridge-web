import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyBookingPayment } from "../service/Api";
import "./PaymentCallback.css";

function PaymentCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState({ loading: true, success: false, message: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const pidx = searchParams.get("pidx");
    if (!pidx) {
      setState({ loading: false, success: false, message: "Missing payment reference." });
      return;
    }

    verifyBookingPayment(pidx)
      .then((res) => {
        setState({ loading: false, success: res.data.success, message: res.data.message });
      })
      .catch((err) => {
        setState({
          loading: false,
          success: false,
          message: err.response?.data?.message || "Failed to verify payment",
        });
      });
  }, [navigate, searchParams]);

  return (
    <div className="pc-page">
      <div className="pc-card">
        {state.loading ? (
          <>
            <span className="pc-spinner" />
            <h2>Verifying your payment...</h2>
            <p>Please wait, this will only take a moment.</p>
          </>
        ) : (
          <>
            <span className={`pc-icon ${state.success ? "pc-icon-success" : "pc-icon-fail"}`}>
              {state.success ? "✓" : "✕"}
            </span>
            <h2>{state.success ? "Booking Confirmed" : "Payment Not Completed"}</h2>
            <p>{state.message}</p>
            <button className="pc-btn" onClick={() => navigate("/student/my-requests")}>
              Go to My Requests
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default PaymentCallback;
