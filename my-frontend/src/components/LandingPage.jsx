import React from 'react';
import '../App.css';
import {
    Navbar,
    Nav,
    Container,
    NavDropdown,
    Dropdown,
    Form,
} from 'react-bootstrap';
import {
    FaShoppingCart,
    FaBell,
    FaUserCircle,
    FaFacebookF,
    FaTwitter,
    FaGoogle,
    FaInstagram,
    FaLinkedin,
    FaGithub,
    FaGem,
    FaHome,
    FaEnvelope,
    FaPhone,
    FaPrint,
} from 'react-icons/fa';

import Logo from '../images/logo.png';

const LandingPage = () => {
    return (
        <>
            {/* Navbar */}
            <Navbar expand="lg" className="shadow-sm bg-mint">
                <Container fluid>
                    <Navbar.Brand href="#">
                        <img
                            src={Logo}
                            height="50"
                            alt="Caro Logo"
                            loading="lazy"
                        />
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="navbarSupportedContent" />
                    <Navbar.Collapse id="navbarSupportedContent">
                        <Nav className="me-auto mb-2 mb-lg-0">
                            <Nav.Link href="#">Dashboard</Nav.Link>
                            <Nav.Link href="#">Team</Nav.Link>
                            <Nav.Link href="#">Projects</Nav.Link>
                        </Nav>

                        <Nav className="align-items-center">
                            <Nav.Link href="#">
                                <FaShoppingCart />
                            </Nav.Link>

                            <Dropdown align="end">
                                <Dropdown.Toggle as="a" className="text-reset nav-link p-0">
                                    <FaBell />
                                    <span className="badge rounded-pill bg-danger ms-1">1</span>
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item href="#">Some news</Dropdown.Item>
                                    <Dropdown.Item href="#">Another news</Dropdown.Item>
                                    <Dropdown.Item href="#">Something else here</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>

                            <Dropdown align="end">
                                <Dropdown.Toggle as="a" className="nav-link p-0 ms-3">
                                    <img
                                        src="https://mdbcdn.b-cdn.net/img/new/avatars/2.webp"
                                        className="rounded-circle"
                                        height="30"
                                        alt="User avatar"
                                        loading="lazy"
                                    />
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item href="#">My profile</Dropdown.Item>
                                    <Dropdown.Item href="#">Settings</Dropdown.Item>
                                    <Dropdown.Item href="#">Logout</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Main content placeholder */}
            <div className="container" style={{ height: '50vh' }}></div>

            {/* Footer */}
            <footer className="text-center text-lg-start bg-light text-muted mt-5">
                <section className="d-flex justify-content-center justify-content-lg-between p-4 border-bottom">
                    <div className="me-5 d-none d-lg-block">
                        <span>Get connected with us on social networks:</span>
                    </div>

                    <div>
                        <a href="#" className="me-4 text-reset"><FaFacebookF /></a>
                        <a href="#" className="me-4 text-reset"><FaTwitter /></a>
                        <a href="#" className="me-4 text-reset"><FaGoogle /></a>
                        <a href="#" className="me-4 text-reset"><FaInstagram /></a>
                        <a href="#" className="me-4 text-reset"><FaLinkedin /></a>
                        <a href="#" className="me-4 text-reset"><FaGithub /></a>
                    </div>
                </section>

                <section>
                    <Container className="text-center text-md-start mt-5">
                        <div className="row mt-3">
                            <div className="col-md-3 col-lg-4 col-xl-3 mx-auto mb-4">
                                <h6 className="text-uppercase fw-bold mb-4">
                                    <FaGem className="me-2" />
                                    Company name
                                </h6>
                                <p>
                                    Here you can use rows and columns to organize your footer content. Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                                </p>
                            </div>

                            <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mb-4">
                                <h6 className="text-uppercase fw-bold mb-4">Products</h6>
                                <p><a href="#!" className="text-reset">Angular</a></p>
                                <p><a href="#!" className="text-reset">React</a></p>
                                <p><a href="#!" className="text-reset">Vue</a></p>
                                <p><a href="#!" className="text-reset">Laravel</a></p>
                            </div>

                            <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mb-4">
                                <h6 className="text-uppercase fw-bold mb-4">Useful links</h6>
                                <p><a href="#!" className="text-reset">Pricing</a></p>
                                <p><a href="#!" className="text-reset">Settings</a></p>
                                <p><a href="#!" className="text-reset">Orders</a></p>
                                <p><a href="#!" className="text-reset">Help</a></p>
                            </div>

                            <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mb-md-0 mb-4">
                                <h6 className="text-uppercase fw-bold mb-4">Contact</h6>
                                <p><FaHome className="me-2" /> New York, NY 10012, US</p>
                                <p><FaEnvelope className="me-2" /> info@example.com</p>
                                <p><FaPhone className="me-2" /> + 01 234 567 88</p>
                                <p><FaPrint className="me-2" /> + 01 234 567 89</p>
                            </div>
                        </div>
                    </Container>
                </section>

                <div className="text-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}>
                    © 2021 Copyright:
                    <a className="text-reset fw-bold" href="https://mdbootstrap.com/"> MDBootstrap.com</a>
                </div>
            </footer>
        </>
    );
};

export default LandingPage;
