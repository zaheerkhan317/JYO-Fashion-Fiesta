import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Form, InputGroup } from 'react-bootstrap';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';
import { FaSearch } from 'react-icons/fa'; // Font Awesome search icon
import './Users.css';

const Users = () => {
  const [userCount, setUserCount] = useState(0);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch user details from Firestore
  const fetchUserDetails = async () => {
    try {
      const usersCollection = collection(db, 'users');
      const userSnapshot = await getDocs(usersCollection);
      const userList = userSnapshot.docs.map(doc => doc.data());
      setUsers(userList);
      setUserCount(userList.length);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  // Filter users based on the search term
  const filteredUsers = users.filter(user =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.uid.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Row className="mb-4">
      <Col xs={12}>
        <Card>
          <h2 className='mt-4'>User Details</h2>
          <Card.Body>
            {/* Search Input */}
            <Form.Group className="mb-3 d-flex justify-content-center">
              <InputGroup style={{ maxWidth: '300px' }}>
                <Form.Control
                  type="text"
                  placeholder="Search by Name, Email, or Phone"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ borderRadius: '0.25rem' }}
                />
                <InputGroup.Text>
                  <FaSearch /> {/* Font Awesome Search Icon */}
                </InputGroup.Text>
              </InputGroup>
            </Form.Group>

            <div className="table-responsive mt-4">
  <Table className="table table-hover text-center">
    <thead className="bg-light">
      <tr>
        <th>User ID</th>
        <th>Name</th>
        <th>Email</th>
        <th>Phone</th>
        <th>Registered Date</th>
      </tr>
    </thead>
    <tbody>
      {filteredUsers.length > 0 ? (
        filteredUsers.map((user, index) => (
          <tr key={index} className="align-middle">
            <td>{user.uid}</td>
            <td>{user.firstName} {user.lastName}</td>
            <td>{user.email}</td>
            <td>{user.phoneNumber || "Google Account"}</td>
            <td>
              {user.registeredDate 
                ? new Date(user.registeredDate.seconds * 1000).toLocaleString()
                : user.createdAt
                }
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="5" className="text-muted">No user details available</td>
        </tr>
      )}
    </tbody>
  </Table>
</div>

          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default Users;
