import React from 'react';
import { Container, Navbar, Button, Row, Col, Form } from 'react-bootstrap';
import { FaWindowMaximize, FaLayerGroup, FaTerminal, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import '../styles/landingstyle.css';
const LandingPage = () => {
    return (
        <>


            {/* Masthead */}
            <header className="masthead">
                <Container className="position-relative">
                    <Row className="justify-content-center">
                        <Col xl={6}>
                            <div className="text-center text-white">
                                <h1 className="mb-5">Generate more leads with a professional landing page!</h1>
                                <Form className="form-subscribe" id="contactForm">
                                    <Row>
                                        <Col>
                                            <Form.Control
                                                size="lg"
                                                type="email"
                                                placeholder="Email Address"
                                                id="emailAddress"
                                                required
                                            />
                                            <div className="invalid-feedback text-white">Email Address is required.</div>
                                            <div className="invalid-feedback text-white">Email Address Email is not valid.</div>
                                        </Col>
                                        <Col xs="auto">
                                            <Button variant="primary" size="lg" type="submit" disabled>
                                                Submit
                                            </Button>
                                        </Col>
                                    </Row>
                                    <div className="d-none" id="submitSuccessMessage">
                                        <div className="text-center mb-3">
                                            <div className="fw-bolder">Form submission successful!</div>
                                            <p>To activate this form, sign up at</p>
                                            <a className="text-white" href="https://startbootstrap.com/solution/contact-forms">
                                                https://startbootstrap.com/solution/contact-forms
                                            </a>
                                        </div>
                                    </div>
                                    <div className="d-none" id="submitErrorMessage">
                                        <div className="text-center text-danger mb-3">Error sending message!</div>
                                    </div>
                                </Form>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </header>

            {/* Icons Grid */}
            <section className="features-icons bg-light text-center">
                <Container>
                    <Row>
                        <Col lg={4}>
                            <div className="features-icons-item mx-auto mb-5 mb-lg-0 mb-lg-3">
                                <div className="features-icons-icon d-flex">
                                    <FaWindowMaximize className="m-auto text-primary" size={32} />
                                </div>
                                <h3>Fully Responsive</h3>
                                <p className="lead mb-0">This theme will look great on any device, no matter the size!</p>
                            </div>
                        </Col>
                        <Col lg={4}>
                            <div className="features-icons-item mx-auto mb-5 mb-lg-0 mb-lg-3">
                                <div className="features-icons-icon d-flex">
                                    <FaLayerGroup className="m-auto text-primary" size={32} />
                                </div>
                                <h3>Bootstrap 5 Ready</h3>
                                <p className="lead mb-0">Featuring the latest build of the new Bootstrap 5 framework!</p>
                            </div>
                        </Col>
                        <Col lg={4}>
                            <div className="features-icons-item mx-auto mb-0 mb-lg-3">
                                <div className="features-icons-icon d-flex">
                                    <FaTerminal className="m-auto text-primary" size={32} />
                                </div>
                                <h3>Easy to Use</h3>
                                <p className="lead mb-0">Ready to use with your own content, or customize the source files!</p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Image Showcases */}
            <section className="showcase">
                <Container fluid className="p-0">
                    <Row className="g-0">
                        <Col lg={6} className="order-lg-2 text-white showcase-img" style={{ backgroundImage: "url('../images/bg-showcase-1.jpg')" }}></Col>
                        <Col lg={6} className="order-lg-1 my-auto showcase-text">
                            <h2>Fully Responsive Design</h2>
                            <p className="lead mb-0">
                                When you use a theme created by Start Bootstrap, you know that the theme will look great on any device, whether it's a phone, tablet, or desktop the page will behave responsively!
                            </p>
                        </Col>
                    </Row>
                    <Row className="g-0">
                        <Col lg={6} className="text-white showcase-img" style={{ backgroundImage: "url('../images/bg-showcase-2.jpg')" }}></Col>
                        <Col lg={6} className="my-auto showcase-text">
                            <h2>Updated For Bootstrap 5</h2>
                            <p className="lead mb-0">
                                Newly improved, and full of great utility classes, Bootstrap 5 is leading the way in mobile responsive web development! All of the themes on Start Bootstrap are now using Bootstrap 5!
                            </p>
                        </Col>
                    </Row>
                    <Row className="g-0">
                        <Col lg={6} className="order-lg-2 text-white showcase-img" style={{ backgroundImage: "url('../images/bg-showcase-3.jpg')" }}></Col>
                        <Col lg={6} className="order-lg-1 my-auto showcase-text">
                            <h2>Easy to Use & Customize</h2>
                            <p className="lead mb-0">
                                Landing Page is just HTML and CSS with a splash of SCSS for users who demand some deeper customization options. Out of the box, just add your content and images, and your new landing page will be ready to go!
                            </p>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Testimonials */}
            <section className="testimonials text-center bg-light">
                <Container>
                    <h2 className="mb-5">What people are saying...</h2>
                    <Row>
                        <Col lg={4}>
                            <div className="testimonial-item mx-auto mb-5 mb-lg-0">
                                <img className="img-fluid rounded-circle mb-3" src="../images/testimonials-1.jpg" alt="..." />
                                <h5>Margaret E.</h5>
                                <p className="font-weight-light mb-0">"This is fantastic! Thanks so much guys!"</p>
                            </div>
                        </Col>
                        <Col lg={4}>
                            <div className="testimonial-item mx-auto mb-5 mb-lg-0">
                                <img className="img-fluid rounded-circle mb-3" src="../images/testimonials-2.jpg" alt="..." />
                                <h5>Fred S.</h5>
                                <p className="font-weight-light mb-0">"Bootstrap is amazing. I've been using it to create lots of super nice landing pages."</p>
                            </div>
                        </Col>
                        <Col lg={4}>
                            <div className="testimonial-item mx-auto mb-5 mb-lg-0">
                                <img className="img-fluid rounded-circle mb-3" src="../images/testimonials-3.jpg" alt="..." />
                                <h5>Sarah W.</h5>
                                <p className="font-weight-light mb-0">"Thanks so much for making these free resources available to us!"</p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Call to Action */}
            <section className="call-to-action text-white text-center" id="signup">
                <Container className="position-relative">
                    <Row className="justify-content-center">
                        <Col xl={6}>
                            <h2 className="mb-4">Ready to get started? Sign up now!</h2>
                            <Form className="form-subscribe" id="contactFormFooter">
                                <Row>
                                    <Col>
                                        <Form.Control
                                            size="lg"
                                            type="email"
                                            placeholder="Email Address"
                                            id="emailAddressBelow"
                                            required
                                        />
                                        <div className="invalid-feedback text-white">Email Address is required.</div>
                                        <div className="invalid-feedback text-white">Email Address Email is not valid.</div>
                                    </Col>
                                    <Col xs="auto">
                                        <Button variant="primary" size="lg" type="submit" disabled>
                                            Submit
                                        </Button>
                                    </Col>
                                </Row>
                                <div className="d-none" id="submitSuccessMessage">
                                    <div className="text-center mb-3">
                                        <div className="fw-bolder">Form submission successful!</div>
                                        <p>To activate this form, sign up at</p>
                                        <a className="text-white" href="https://startbootstrap.com/solution/contact-forms">
                                            https://startbootstrap.com/solution/contact-forms
                                        </a>
                                    </div>
                                </div>
                                <div className="d-none" id="submitErrorMessage">
                                    <div className="text-center text-danger mb-3">Error sending message!</div>
                                </div>
                            </Form>
                        </Col>
                    </Row>
                </Container>
            </section>


        </>
    );
};

export default LandingPage;
