import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import "./tablestyle.css";
const UserCard = ({ id, name, email, phone, website }) => {
    const navigate = useNavigate();

    return (
        <Card style={{ width: '18rem' }} className="mb-3">
            <Card.Body className="bg-primary" style={{borderRadius: "5px"}}>
                <Card.Title>{name}</Card.Title>
                <Card.Text>
                    📧 {email} <br />
                    📞 {phone}
                </Card.Text>
                <Button style={{backgroundColor:'orange'}} onClick={() => navigate(`/user/${id}`)}>
                    View Details
                </Button>
            </Card.Body>
        </Card>
    );
};

export default UserCard;
