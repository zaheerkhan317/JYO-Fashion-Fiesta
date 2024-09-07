
import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table } from 'react-bootstrap';
import { getFirestore, collection, getDocs} from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';

const Users = () => {
  const [userCount, setUserCount] = useState(0);
  const [users, setUsers] = useState([]);

  // Firestore instance
  const firestore = getFirestore();

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

  return (
    <Row className="mb-4">
      <Col xs={12}>
        <Card>
          <Card.Header>User Details</Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table striped bordered hover className="text-center">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Registered Date</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user, index) => (
                      <tr key={index}>
                        <td>{user.firstName} {user.lastName}</td>
                        <td>{user.email}</td>
                        <td>{user.phoneNumber || "Google Account"}</td>
                        <td>
                          {user.registeredDate 
                            ? new Date(user.registeredDate.seconds * 1000).toLocaleString()
                            : user.createdAt
                              ? new Date(user.createdAt).toLocaleString()
                              : "No Date Available"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No user details available</td>
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
