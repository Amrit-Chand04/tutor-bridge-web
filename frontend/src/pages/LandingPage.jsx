import Navbar from "../component/Navbar";
import heroImg from "../assets/my_pic.png";
import logo from "../assets/tutor_bridge_logo.png";
import "../App.css";

const steps = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="1.8">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M9 13h6M9 17h6" />
      </svg>
    ),
    iconBg: "#ece9fe",
    title: "Post Your Tuition Request",
    description:
      "Create a tuition request by sharing your subject, grade, location, and learning requirements. Qualified tutors will be able to view and apply.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8">
        <path d="M16 3l4 4-4 4" />
        <path d="M20 7H4" />
        <path d="M8 21l-4-4 4-4" />
        <path d="M4 17h16" />
      </svg>
    ),
    iconBg: "#dcfce7",
    title: "Compare Tutor Applications",
    description:
      "Review applications from interested tutors and compare their experience, qualifications, and teaching approach to find the best match.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
        <path d="M9 16l2 2 4-4" />
      </svg>
    ),
    iconBg: "#ffedd5",
    title: "Book Your Tutor",
    description:
      "Choose the tutor that best fits your needs, connect directly, and start your learning journey with confidence.",
  },
];

const aboutFeatures = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8">
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    iconBg: "#dbeafe",
    title: "Verified Tutors",
    description: "Every tutor is verified so you can learn with confidence.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8">
        <path d="M9 12a4 4 0 0 1 4-4h3a4 4 0 1 1 0 8h-1" />
        <path d="M15 12a4 4 0 0 1-4 4H8a4 4 0 1 1 0-8h1" />
      </svg>
    ),
    iconBg: "#dcfce7",
    title: "Direct Student–Tutor Connections",
    description: "Message and book tutors directly, no middleman involved.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="1.8">
        <path d="M12 3H5a2 2 0 0 0-2 2v7l10 10 9-9L12 3z" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M4 4l16 16" />
      </svg>
    ),
    iconBg: "#ffedd5",
    title: "Transparent Pricing",
    description: "Affordable service fees with complete transparency.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="1.8">
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </svg>
    ),
    iconBg: "#ece9fe",
    title: "Secure Connections",
    description:
      "Connect with trusted tutors and students on a transparent platform.",
  },
];

function LandingPage() {
  return (
    <div>
      <Navbar />

      <section className="hero">
        <div className="hero-text">
          <span className="hero-badge">CONNECT &nbsp;·&nbsp; LEARN &nbsp;·&nbsp; GROW</span>
          <h1>
            Connecting Tutors
            <br />
            &amp; Students
            <br />
            <span className="accent">Directly</span>
          </h1>
          <p>
            Find trusted tutors and tuition opportunities without brokers,
            hidden fees, or unnecessary commissions.
          </p>
          <button type="button" className="btn btn-primary btn-lg">
            Get Started
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>

        <div className="hero-image">
          <img src={heroImg} alt="Tutor working on a laptop" />
        </div>
      </section>

      <section id="about" className="about">
        <div className="about-container">
          <div className="about-left">
            <h2>About TutorBridge</h2>
            <p>
              TutorBridge connects students and tutors directly—without
              brokers or hidden commissions. Find the right tutor and start
              learning through a platform built on trust and transparency.
            </p>
            <a href="#how-it-works" className="btn btn-outline">
              Learn More
            </a>
          </div>

          <div className="about-grid">
            {aboutFeatures.map((feature) => (
              <div className="about-card" key={feature.title}>
                <div className="about-icon" style={{ background: feature.iconBg }}>
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="how-it-works">
        <h2>How it Works</h2>
        <p className="how-it-works-subtitle">
          Simple, transparent, and built for academic success. Here is how we
          bridge the gap between learning and teaching.
        </p>

        <div className="steps-grid">
          {steps.map((step) => (
            <div className="step-card" key={step.title}>
              <div className="step-icon" style={{ background: step.iconBg }}>
                {step.icon}
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer id="contact" className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <img src={logo} alt="Tutor Bridge" />
            <p>Connecting Tutors and Students Directly.</p>
          </div>

          <div className="footer-links">
            <h4>Quick Links</h4>
            <a href="#about">About Us</a>
            <a href="#how-it-works">How It Works</a>
          </div>

          <div className="footer-contact">
            <p>chandamrit62@gmail.com</p>
            <p>9745702074</p>
            <p>Kathmandu, Nepal</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} TutorBridge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
