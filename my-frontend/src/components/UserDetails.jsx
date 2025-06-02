import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Container, Button, Spinner, Alert } from 'react-bootstrap';
import "./tablestyle.css";
const UserDetails = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`https://jsonplaceholder.typicode.com/users/${id}`)
            .then(res => res.json())
            .then(data => {
                setUser(data);
                setLoading(false);
            })
            .catch(err => {
                setError('Could not load user details');
                setLoading(false);
            });
    }, [id]);

    if (loading) return <Spinner animation="border" className="m-3" />;
    if (error) return <Alert variant="danger">{error}</Alert>;
    if (!user) return <p>User not found</p>;

    return (
        <Container className="mt-4 d-flex justify-content-center">
            <Card style={{ width: '30rem' }}>
                <Card.Body className="bg-primary">
                    <Card.Title>{user.name}</Card.Title>
                    <Card.Text>
                        <strong>Username:</strong> {user.username} <br />
                        <strong>Email:</strong> {user.email} <br />
                        <strong>Phone:</strong> {user.phone} <br />
                        <strong>Website:</strong>{' '}
                        <a href={`https://${user.website}`} target="_blank" rel="noreferrer">
                            {user.website}
                        </a>
                        <br />
                        <strong>Company:</strong> {user.company?.name} <br />
                        <strong>Address:</strong> {user.address?.street}, {user.address?.city}
                    </Card.Text>
                    <Link to="/">
                        <Button style={{backgroundColor:"orange"}}>← Back to Users</Button>
                    </Link>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default UserDetails;
