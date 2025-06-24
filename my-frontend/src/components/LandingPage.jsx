import React from 'react';
import { Container, Button, Row, Col, Form, Card } from 'react-bootstrap';
import {
    FaWindowMaximize,
    FaLayerGroup,
    FaTerminal,
    FaChartLine,
    FaDatabase,
    FaCogs,
    FaArrowRight,
    FaPlay,
    FaStar
} from 'react-icons/fa';
import '../styles/landingstyle.css';
import Img0 from '../images/bg-masthead.jpg';
import Img1 from '../images/bg-showcase-1.jpg';
import Img2 from '../images/bg-showcase-2.jpg';
import Img3 from '../images/bg-showcase-3.jpg';
import Img4 from '../images/testimonials-1.jpg';
import Img5 from '../images/testimonials-2.jpg';
import Img6 from '../images/testimonials-3.jpg';
import Navigation from "./Navigation";
import Footer from "./Footer";

const LandingPage = () => {
    return (
        <>
            <Navigation/>

            {/* Hero Section */}
            <section className="hero-section">
                <Container className="position-relative">
                    <Row className="align-items-center min-vh-100">
                        <Col lg={6}>
                            <div className="hero-content">
                                <div className="hero-badge">
                                    <span>🚀 Leading Big Data Solutions</span>
                                </div>
                                <h1 className="hero-title">
                                    Transform Your Data Into
                                    <span className="gradient-text"> Actionable Insights</span>
                                </h1>
                                <p className="hero-description">
                                    Çaro Consulting LLC empowers businesses with cutting-edge big data analytics,
                                    business intelligence, and strategic consulting services. Turn your data into
                                    your competitive advantage.
                                </p>
                                <div className="hero-actions">
                                    <Button size="lg" className="btn-mint me-3">
                                        Get Started
                                        <FaArrowRight className="ms-2" />
                                    </Button>
                                    <Button variant="outline-primary" size="lg" className="btn-watch-demo">
                                        <FaPlay className="me-2" />
                                        Watch Demo
                                    </Button>
                                </div>
                                <div className="hero-stats">
                                    <div className="stat-item">
                                        <span className="stat-number">500+</span>
                                        <span className="stat-label">Projects Completed</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-number">100+</span>
                                        <span className="stat-label">Happy Clients</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-number">99%</span>
                                        <span className="stat-label">Success Rate</span>
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col lg={6}>
                            <div className="hero-visual">
                                <div className="floating-cards">
                                    <div className="floating-card card-1">
                                        <FaChartLine className="card-icon" />
                                        <span>Analytics</span>
                                    </div>
                                    <div className="floating-card card-2">
                                        <FaDatabase className="card-icon" />
                                        <span>Big Data</span>
                                    </div>
                                    <div className="floating-card card-3">
                                        <FaCogs className="card-icon" />
                                        <span>AI/ML</span>
                                    </div>
                                </div>
                                <div className="hero-image-container">
                                    <img src={Img0} alt="Data Analytics" className="hero-image" />
                                    <div className="image-overlay"></div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
                <div className="hero-background">
                    <div className="bg-shape shape-1"></div>
                    <div className="bg-shape shape-2"></div>
                    <div className="bg-shape shape-3"></div>
                </div>
            </section>

            {/* Services Section */}
            <section className="services-section">
                <Container>
                    <div className="section-header text-center">
                        <h2 className="section-title">Our Core Services</h2>
                        <p className="section-subtitle">
                            Comprehensive solutions for your data and analytics needs
                        </p>
                    </div>
                    <Row className="g-4">
                        <Col lg={4} md={6}>
                            <Card className="service-card">
                                <Card.Body>
                                    <div className="service-icon">
                                        <FaChartLine />
                                    </div>
                                    <h4 className="service-title">Data Analytics</h4>
                                    <p className="service-description">
                                        Transform raw data into meaningful insights with our advanced
                                        analytics solutions and data visualization tools.
                                    </p>
                                    <div className="service-features">
                                        <span className="feature-tag">Real-time Processing</span>
                                        <span className="feature-tag">Custom Dashboards</span>
                                        <span className="feature-tag">Predictive Models</span>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={4} md={6}>
                            <Card className="service-card featured">
                                <div className="featured-badge">Most Popular</div>
                                <Card.Body>
                                    <div className="service-icon">
                                        <FaDatabase />
                                    </div>
                                    <h4 className="service-title">Big Data Solutions</h4>
                                    <p className="service-description">
                                        Handle massive datasets with our scalable big data infrastructure
                                        and processing capabilities.
                                    </p>
                                    <div className="service-features">
                                        <span className="feature-tag">Cloud Integration</span>
                                        <span className="feature-tag">Distributed Computing</span>
                                        <span className="feature-tag">Data Lakes</span>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={4} md={6}>
                            <Card className="service-card">
                                <Card.Body>
                                    <div className="service-icon">
                                        <FaCogs />
                                    </div>
                                    <h4 className="service-title">AI & Machine Learning</h4>
                                    <p className="service-description">
                                        Leverage artificial intelligence and machine learning to automate
                                        processes and gain competitive advantages.
                                    </p>
                                    <div className="service-features">
                                        <span className="feature-tag">Neural Networks</span>
                                        <span className="feature-tag">NLP</span>
                                        <span className="feature-tag">Computer Vision</span>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Features Showcase */}
            <section className="features-showcase">
                <Container>
                    <Row className="g-5 align-items-center">
                        <Col lg={6}>
                            <div className="showcase-image">
                                <img src={Img1} alt="Responsive Design" className="img-fluid rounded-3" />
                                <div className="image-decoration"></div>
                            </div>
                        </Col>
                        <Col lg={6}>
                            <div className="showcase-content">
                                <h3 className="showcase-title">Fully Responsive Design</h3>
                                <p className="showcase-description">
                                    Our solutions work seamlessly across all devices and platforms.
                                    Whether you're on a phone, tablet, or desktop, you'll have access
                                    to the same powerful analytics and insights.
                                </p>
                                <ul className="feature-list">
                                    <li>Mobile-first responsive design</li>
                                    <li>Cross-platform compatibility</li>
                                    <li>Optimized performance on all devices</li>
                                    <li>Progressive Web App capabilities</li>
                                </ul>
                                <Button variant="outline-primary" className="mt-3">
                                    Learn More <FaArrowRight className="ms-2" />
                                </Button>
                            </div>
                        </Col>
                    </Row>

                    <Row className="g-5 align-items-center flex-lg-row-reverse">
                        <Col lg={6}>
                            <div className="showcase-image">
                                <img src={Img2} alt="Modern Technology" className="img-fluid rounded-3" />
                                <div className="image-decoration"></div>
                            </div>
                        </Col>
                        <Col lg={6}>
                            <div className="showcase-content">
                                <h3 className="showcase-title">Cutting-Edge Technology</h3>
                                <p className="showcase-description">
                                    We leverage the latest technologies and frameworks to deliver
                                    robust, scalable solutions that grow with your business needs.
                                </p>
                                <ul className="feature-list">
                                    <li>Modern cloud infrastructure</li>
                                    <li>Microservices architecture</li>
                                    <li>Real-time data processing</li>
                                    <li>Advanced security protocols</li>
                                </ul>
                                <Button variant="outline-primary" className="mt-3">
                                    Explore Tech Stack <FaArrowRight className="ms-2" />
                                </Button>
                            </div>
                        </Col>
                    </Row>

                    <Row className="g-5 align-items-center">
                        <Col lg={6}>
                            <div className="showcase-image">
                                <img src={Img3} alt="Easy Integration" className="img-fluid rounded-3" />
                                <div className="image-decoration"></div>
                            </div>
                        </Col>
                        <Col lg={6}>
                            <div className="showcase-content">
                                <h3 className="showcase-title">Easy Integration & Customization</h3>
                                <p className="showcase-description">
                                    Our solutions integrate seamlessly with your existing systems
                                    and can be customized to meet your specific business requirements.
                                </p>
                                <ul className="feature-list">
                                    <li>API-first architecture</li>
                                    <li>Custom integrations</li>
                                    <li>White-label solutions</li>
                                    <li>24/7 technical support</li>
                                </ul>
                                <Button variant="outline-primary" className="mt-3">
                                    View Integrations <FaArrowRight className="ms-2" />
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Testimonials */}
            <section className="testimonials-section">
                <Container>
                    <div className="section-header text-center">
                        <h2 className="section-title">What Our Clients Say</h2>
                        <p className="section-subtitle">
                            Trusted by industry leaders worldwide
                        </p>
                    </div>
                    <Row className="g-4">
                        <Col lg={4} md={6}>
                            <Card className="testimonial-card">
                                <Card.Body>
                                    <div className="stars">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar key={i} className="star" />
                                        ))}
                                    </div>
                                    <p className="testimonial-text">
                                        "Çaro Consulting transformed our data strategy. The insights
                                        we gained helped us increase revenue by 40% in just six months."
                                    </p>
                                    <div className="testimonial-author">
                                        <img src={Img4} alt="Margaret E." className="author-avatar" />
                                        <div className="author-info">
                                            <h6 className="author-name">Margaret E.</h6>
                                            <span className="author-title">CEO, TechCorp</span>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={4} md={6}>
                            <Card className="testimonial-card">
                                <Card.Body>
                                    <div className="stars">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar key={i} className="star" />
                                        ))}
                                    </div>
                                    <p className="testimonial-text">
                                        "Outstanding service and expertise. Their big data solutions
                                        helped us process millions of records efficiently and accurately."
                                    </p>
                                    <div className="testimonial-author">
                                        <img src={Img5} alt="Fred S." className="author-avatar" />
                                        <div className="author-info">
                                            <h6 className="author-name">Fred S.</h6>
                                            <span className="author-title">CTO, DataFlow Inc</span>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={4} md={6}>
                            <Card className="testimonial-card">
                                <Card.Body>
                                    <div className="stars">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar key={i} className="star" />
                                        ))}
                                    </div>
                                    <p className="testimonial-text">
                                        "Professional, reliable, and innovative. Çaro Consulting
                                        exceeded our expectations in every aspect of the project."
                                    </p>
                                    <div className="testimonial-author">
                                        <img src={Img6} alt="Sarah W." className="author-avatar" />
                                        <div className="author-info">
                                            <h6 className="author-name">Sarah W.</h6>
                                            <span className="author-title">Director, Analytics Plus</span>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <Container>
                    <Row className="justify-content-center">
                        <Col xl={8} lg={10}>
                            <div className="cta-content text-center">
                                <h2 className="cta-title">Ready to Transform Your Data?</h2>
                                <p className="cta-description">
                                    Join hundreds of companies that trust Çaro Consulting to unlock
                                    the full potential of their data. Start your journey today.
                                </p>
                                <Form className="cta-form">
                                    <Row className="align-items-center justify-content-center">
                                        <Col md={6} lg={5}>
                                            <Form.Control
                                                size="lg"
                                                type="email"
                                                placeholder="Enter your email address"
                                                className="cta-input"
                                                required
                                            />
                                        </Col>
                                        <Col md={4} lg={3}>
                                            <Button size="lg" className="btn-mint w-100">
                                                Get Started
                                            </Button>
                                        </Col>
                                    </Row>
                                </Form>
                                <p className="cta-note">
                                    No spam, unsubscribe at any time. Free consultation included.
                                </p>
                            </div>
                        </Col>
                    </Row>
                </Container>
                <div className="cta-background">
                    <div className="cta-shape shape-1"></div>
                    <div className="cta-shape shape-2"></div>
                </div>
            </section>

            <Footer/>
        </>
    );
};

export default LandingPage;
