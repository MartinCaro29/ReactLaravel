import {
    FaEnvelope,
    FaFacebookF,
    FaGem,
    FaGithub,
    FaGoogle,
    FaHome,
    FaInstagram,
    FaLinkedin,
    FaPhone,
    FaPrint,
    FaTwitter,
    FaUsers,
    FaTachometerAlt,
    FaCog,
    FaQuestionCircle
} from "react-icons/fa";
import { Container, Row, Col } from "react-bootstrap";
import React from 'react';
import '../styles/footer.css';

const Footer = () => {
    return (
        <footer className="modern-footer">
            {/* Social Bar */}
            <section className="social-bar">
                <Container>
                    <div className="social-content">
                        <div className="social-text">
                            <span>Connect with us on social networks</span>
                        </div>
                        <div className="social-links">
                            <a href="#" className="social-link" aria-label="Facebook">
                                <FaFacebookF />
                            </a>
                            <a href="#" className="social-link" aria-label="Twitter">
                                <FaTwitter />
                            </a>
                            <a href="#" className="social-link" aria-label="Google">
                                <FaGoogle />
                            </a>
                            <a href="#" className="social-link" aria-label="Instagram">
                                <FaInstagram />
                            </a>
                            <a href="#" className="social-link" aria-label="LinkedIn">
                                <FaLinkedin />
                            </a>
                            <a href="#" className="social-link" aria-label="GitHub">
                                <FaGithub />
                            </a>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Main Footer Content */}
            <section className="footer-main">
                <Container>
                    <Row className="g-4">
                        {/* Company Info */}
                        <Col md={6} lg={4}>
                            <div className="footer-section">
                                <h6 className="footer-title">
                                    <FaGem className="me-2" />
                                    Çaro Consulting LLC
                                </h6>
                                <p className="footer-description">
                                    Leading the way in big data analytics and consulting.
                                    We transform data into actionable insights that drive business growth
                                    and innovation.
                                </p>
                                <div className="company-stats">
                                    <div className="stat-item">
                                        <span className="stat-number">500+</span>
                                        <span className="stat-label">Projects</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-number">100+</span>
                                        <span className="stat-label">Clients</span>
                                    </div>
                                </div>
                            </div>
                        </Col>

                        {/* Quick Links */}
                        <Col md={6} lg={2}>
                            <div className="footer-section">
                                <h6 className="footer-title">Quick Links</h6>
                                <ul className="footer-links">
                                    <li>
                                        <a href="/" className="footer-link">
                                            <FaHome className="me-2" />
                                            Home
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/dashboard" className="footer-link">
                                            <FaTachometerAlt className="me-2" />
                                            Dashboard
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/team" className="footer-link">
                                            <FaUsers className="me-2" />
                                            Team
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/projects" className="footer-link">
                                            Projects
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </Col>

                        {/* Services */}
                        <Col md={6} lg={3}>
                            <div className="footer-section">
                                <h6 className="footer-title">Our Services</h6>
                                <ul className="footer-links">
                                    <li>
                                        <a href="/services/data-analytics" className="footer-link">
                                            Data Analytics
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/services/business-intelligence" className="footer-link">
                                            Business Intelligence
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/services/consulting" className="footer-link">
                                            Strategic Consulting
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/services/training" className="footer-link">
                                            Training & Support
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </Col>

                        {/* Contact Info */}
                        <Col md={6} lg={3}>
                            <div className="footer-section">
                                <h6 className="footer-title">Contact Us</h6>
                                <div className="contact-info">
                                    <div className="contact-item">
                                        <FaHome className="contact-icon" />
                                        <div className="contact-details">
                                            <span>123 Business Ave</span>
                                            <span>New York, NY 10012</span>
                                        </div>
                                    </div>
                                    <div className="contact-item">
                                        <FaEnvelope className="contact-icon" />
                                        <div className="contact-details">
                                            <a href="mailto:info@caroconsulting.com" className="contact-link">
                                                info@caroconsulting.com
                                            </a>
                                        </div>
                                    </div>
                                    <div className="contact-item">
                                        <FaPhone className="contact-icon" />
                                        <div className="contact-details">
                                            <a href="tel:+12345678888" className="contact-link">
                                                +1 (234) 567-8888
                                            </a>
                                        </div>
                                    </div>
                                    <div className="contact-item">
                                        <FaPrint className="contact-icon" />
                                        <div className="contact-details">
                                            <span>+1 (234) 567-8889</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Footer Bottom */}
            <section className="footer-bottom">
                <Container>
                    <div className="footer-bottom-content">
                        <div className="copyright">
                            <span>© 2024 Çaro Consulting LLC. All rights reserved.</span>
                        </div>
                        <div className="footer-bottom-links">
                            <a href="/privacy" className="footer-bottom-link">Privacy Policy</a>
                            <a href="/terms" className="footer-bottom-link">Terms of Service</a>
                            <a href="/support" className="footer-bottom-link">
                                <FaQuestionCircle className="me-1" />
                                Support
                            </a>
                        </div>
                    </div>
                </Container>
            </section>
        </footer>
    );
};

export default Footer;
