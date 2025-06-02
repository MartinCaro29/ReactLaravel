import React, { useEffect, useState } from 'react';
import UserCard from './UserCard';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('https://jsonplaceholder.typicode.com/users')
            .then(res => res.json())
            .then(data => {
                setUsers(data);
                setLoading(false);
            })
            .catch(err => {
                setError('Failed to fetch users');
                setLoading(false);
            });
    }, []);

    if (loading) return <Spinner animation="border" className="m-3" />;
    if (error) return <Alert variant="danger">{error}</Alert>;

    return (
        <Container className="mt-4">
            <Row>
                {users.map(user => (
                    <Col key={user.id} md={4}>
                        <UserCard
                            id={user.id}
                            name={user.name}
                            email={user.email}
                            phone={user.phone}
                            website={user.website}
                        />
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default UserList;
