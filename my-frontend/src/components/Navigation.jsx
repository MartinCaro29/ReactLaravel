import {Container, Dropdown, Nav, Navbar} from "react-bootstrap";
import Logo from "../images/logo.png";
import {FaBell, FaShoppingCart} from "react-icons/fa";
import React from "react";
import '../styles/navigation.css';


const Navigation = () => {
    return (

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
                    <Nav.Link className="text-navy" href="#">Dashboard</Nav.Link>
                    <Nav.Link className="text-navy" href="#">Team</Nav.Link>
                    <Nav.Link className="text-navy" href="#">Projects</Nav.Link>
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
    );
};

export default Navigation;

