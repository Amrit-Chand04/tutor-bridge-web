const { createPayment, setPidx, getPaymentByPidx, updatePaymentStatus } = require("../models/paymentModel");
const {
  getApplicationById,
  acceptApplication,
  rejectOtherPendingApplications,
} = require("../models/tuitionApplicationModel");
const { getRequestById, closeRequest } = require("../models/tuitionRequestModel");
const { createBooking } = require("../models/bookingModel");
const { getUserContact } = require("../models/userModel");
const { initiatePayment, lookupPayment } = require("../services/khaltiService");
const { createNotification, createNotificationsForRole } = require("../models/notificationModel");
const { emitToUser, emitToRole } = require("../services/socketService");

const BOOKING_FEE_PAISA = 1000; // Rs 10 flat booking fee

const KHALTI_STATUS_MAP = {
  Completed: "completed",
  Pending: "pending",
  Initiated: "initiated",
  Expired: "expired",
  "User canceled": "canceled",
  Refunded: "completed",
  "Partially Refunded": "completed",
};

const STATUS_MESSAGES = {
  completed: "Your request is awaiting admin approval.",
  pending: "Payment is still pending. Please try again in a moment.",
  expired: "Payment link expired. Please try booking again.",
  canceled: "Payment was canceled.",
  initiated: "Payment was not completed.",
};

const initiateBookingPayment = async (req, res) => {
  try {
    const { applicationId } = req.body;

    const application = await getApplicationById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const request = await getRequestById(application.request_id);
    if (!request || request.user_id !== req.user.user_id) {
      return res.status(403).json({ message: "You can only book tutors for your own requests" });
    }
    if (request.status !== "open" || application.status !== "pending") {
      return res.status(400).json({ message: "This application is no longer available for booking" });
    }

    const student = await getUserContact(req.user.user_id);
    const payment = await createPayment(applicationId, BOOKING_FEE_PAISA);

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const khaltiRes = await initiatePayment({
      amount: BOOKING_FEE_PAISA,
      purchaseOrderId: `booking-${payment.payment_id}`,
      purchaseOrderName: `Tutor Booking Fee - Application #${applicationId}`,
      returnUrl: `${frontendUrl}/student/payment/callback`,
      websiteUrl: frontendUrl,
      customerInfo: { name: student.full_name, email: student.email },
    });

    await setPidx(payment.payment_id, khaltiRes.pidx);

    res.status(200).json({
      payment_url: khaltiRes.payment_url,
      pidx: khaltiRes.pidx,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to initiate payment",
      error: error.message,
    });
  }
};

const verifyBookingPayment = async (req, res) => {
  try {
    const { pidx } = req.body;

    const payment = await getPaymentByPidx(pidx);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const application = await getApplicationById(payment.application_id);
    const request = await getRequestById(application.request_id);
    if (!request || request.user_id !== req.user.user_id) {
      return res.status(403).json({ message: "You can only verify your own payments" });
    }

    const lookup = await lookupPayment(pidx);
    const mappedStatus = KHALTI_STATUS_MAP[lookup.status] || "pending";
    await updatePaymentStatus(payment.payment_id, mappedStatus, lookup.transaction_id);

    if (mappedStatus === "completed" && application.status === "pending") {
      await acceptApplication(application.application_id);
      await rejectOtherPendingApplications(application.request_id, application.application_id);
      await closeRequest(application.request_id);
      await createBooking(application.request_id, request.user_id, application.tutor_id);

      await createNotification(request.user_id, "Payment successful");
      emitToUser(request.user_id, "notification", { message: "Payment successful", created_at: new Date() });

      const adminMessage = `New booking request awaiting approval: ${request.subject}`;
      await createNotificationsForRole("admin", adminMessage);
      emitToRole("admin", "notification", { message: adminMessage, created_at: new Date() });
    }

    res.status(200).json({
      success: mappedStatus === "completed",
      status: mappedStatus,
      message: STATUS_MESSAGES[mappedStatus] || "Payment could not be confirmed",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to verify payment",
      error: error.message,
    });
  }
};

module.exports = { initiateBookingPayment, verifyBookingPayment };
