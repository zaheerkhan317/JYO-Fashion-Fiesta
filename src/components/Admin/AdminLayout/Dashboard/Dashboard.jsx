import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup } from 'react-bootstrap';
import { FaUsers, FaCalendarAlt, FaBox, FaShoppingCart, FaStar, FaBoxOpen } from 'react-icons/fa';
import { getFirestore, collection, onSnapshot, orderBy, query, count } from 'firebase/firestore';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns';
import './Dashboard.css';
import Users from '../Users/Users';


ChartJS.register( Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, TimeScale );


// Function to convert a date string to a JavaScript Date object
const parseDateString = (dateString) => {
  const [datePart, timePart] = dateString.split(', ');

  if (!datePart || !timePart) {
    console.error('Date or time part missing in:', dateString);
    return new Date(NaN);  // Return Invalid Date
  }

  const [day, month, year] = datePart.split('/').map(num => parseInt(num, 10));
  const [hours, minutes, seconds] = timePart.split(':').map(num => parseInt(num, 10));
  const [ampm] = timePart.split(' ').slice(-1);

  let hours24 = hours;
  if (ampm === 'pm' && hours24 !== 12) hours24 += 12;
  if (ampm === 'am' && hours24 === 12) hours24 = 0;

  const parsedDate = new Date(year, month - 1, day, hours24, minutes, seconds);

  if (isNaN(parsedDate.getTime())) {
    console.error('Invalid Date created from:', dateString);
    return new Date(NaN);  // Return Invalid Date
  }

  return parsedDate;
};

const parseTimestamp = (timestamp) => {
  if (!timestamp) {
    // Handle undefined or null timestamps by returning a default value
    console.warn('Timestamp is undefined or null');
    return new Date(); // Default to the current date
  }

  // Check if timestamp is a string
  if (typeof timestamp !== 'string') {
    console.warn('Timestamp is not a string');
    return new Date(); // Default to the current date
  }

  const [datePart] = timestamp.split(', ');
  if (!datePart) {
    console.warn('Date part is missing from timestamp');
    return new Date(); // Default to the current date
  }

  const [day, month, year] = datePart.split('/');
  if (!day || !month || !year) {
    console.warn('Date components are missing from date part');
    return new Date(); // Default to the current date
  }

  return new Date(year, month - 1, day);
};


const getCurrentWeekDates = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)));
  monday.setHours(0, 0, 0, 0);

  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    weekDates.push(date.toLocaleDateString('en-GB'));
  }
  return weekDates;
};

const Dashboard = () => {
  const [userCount, setUserCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [productGraph, setProductGraph] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [userRegistrations, setUserRegistrations] = useState([]);
  const db = getFirestore();

  useEffect(() => {

    const weekDates = getCurrentWeekDates();
    const dayCounts = {};

    weekDates.forEach(date => {
      dayCounts[date] = 0;
    });


    const productsWeekDates = getCurrentWeekDates();
    const productsDayCounts = {};

    productsWeekDates.forEach(date => {
      productsDayCounts[date] = 0;
    });

    const users_reg_Collection = collection(db, 'activities');
    const usersQuery = query(users_reg_Collection);

    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const timestamp = parseTimestamp(data.timestamp);
        const formattedDate = timestamp.toLocaleDateString('en-GB');

        if (dayCounts.hasOwnProperty(formattedDate)) {
          dayCounts[formattedDate] += 1;
        }
      });

      const chartData = weekDates.map(date => ({
        date,
        count: dayCounts[date] || 0
      }));

      setUserRegistrations(chartData);
      console.log("user registrations log : ",userRegistrations);
    });


    const products_reg_Collection = collection(db, 'products');
    const productQuery = query(products_reg_Collection);

    const productGraph = onSnapshot(productQuery, (snapshot) => {
      snapshot.docs.forEach(doc => {
        const productsData = doc.data();
        const productsTimestamp = parseTimestamp(productsData.createdAt);
        const productsFormattedDate = productsTimestamp.toLocaleDateString('en-GB');
        if (productsDayCounts.hasOwnProperty(productsFormattedDate)) {
          productsDayCounts[productsFormattedDate] += 1;
        }
      });

      const chartData = productsWeekDates.map(date => ({
        date,
        count: productsDayCounts[date] || 0
      }));
      setProductGraph(chartData);
      
    });

    //Fetch Product Count
    const productCollection = collection(db, 'products');
    const products = onSnapshot(productCollection, (snapshot) => {
      const totalProducts = snapshot.size;
      setProductCount(totalProducts);
    }, (error) => {
      console.error('Error fetching products:', error);
    });


    // Fetch user count
    const usersCollection = collection(db, 'users');
    const unsubscribeUsers = onSnapshot(usersCollection, (snapshot) => {
      const totalUsers = snapshot.size;
      setUserCount(totalUsers);
    }, (error) => {
      console.error('Error fetching users:', error);
    });

    // Fetch recent activities
    const activitiesCollection = collection(db, 'activities');
    const activitiesQuery = query(activitiesCollection, orderBy('timestamp', 'desc'));

    const unsubscribeActivities = onSnapshot(activitiesQuery, (snapshot) => {
      const todayDateString = new Date().toLocaleDateString('en-GB');

      const activities = snapshot.docs.map(doc => {
        const data = doc.data();
        const timestamp = parseDateString(data.timestamp);
        const timestampDateString = timestamp.toLocaleDateString('en-GB');
        console.log("Activities time stamp: ",timestampDateString);
        return {
          id: doc.id,
          ...data,
          timestamp
        };
      }).filter(activity => {
        const activityDateString = activity.timestamp.toLocaleDateString('en-GB');
        return activityDateString === todayDateString;
      });

      console.log('Filtered activities:', activities);
      setRecentActivities(activities);
    }, (error) => {
      console.error('Error fetching activities:', error);
    });

    

    

    return () => {
      unsubscribe();
      productGraph();
      unsubscribeUsers();
      unsubscribeActivities();
      products();
    };
  }, [db]);



   const chartData = {
    labels: userRegistrations.map(reg => reg.date),
    labels: productGraph.map(reg1 => reg1.date),
    datasets: [
      {
        label: 'User Registrations',
        data: userRegistrations.map(reg => ({
          x: reg.date,
          y: reg.count
        })),
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        fill: true,
      },
      {
        label: 'Product Counts',
        data: productGraph.map(reg1 => ({
          x: reg1.date,
          y: reg1.count
        })),
        borderColor: 'rgba(255,99,132,1)', // Different color for the product count dataset
        backgroundColor: 'rgba(255,99,132,0.2)',
        fill: true,
      }
    ]
  };

  const chartOptions = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Count'
        },
        beginAtZero: true,
      }
    }
  };


  return (
    <Container fluid>
  <Row className="mb-4">
    {/* First row with 4 cards (Users, Products, Orders, Reviews) */}
    <Col xs={12} sm={6} md={3} lg={3} className="mb-4">
      <Card>
        <Card.Body>
          <Card.Title>Users</Card.Title>
          <Card.Text>
            <h3><FaUsers /> {userCount}</h3>
            Total users registered
          </Card.Text>
        </Card.Body>
      </Card>
    </Col>
    <Col xs={12} sm={6} md={3} lg={3} className="mb-4">
    <Card>
      <Card.Body>
        <Card.Title>Products</Card.Title>
        <Card.Text>
        <h3><FaBoxOpen size={30}/> {productCount}</h3>
          Products available
        </Card.Text>
      </Card.Body>
    </Card>
    </Col>
    <Col xs={12} sm={6} md={3} lg={3} className="mb-4">
      <Card>
        <Card.Body>
          <Card.Title>Orders</Card.Title>
          <Card.Text>
            <h3><FaShoppingCart /> {/* {orderCount} */}</h3>
            Orders placed this month
          </Card.Text>
        </Card.Body>
      </Card>
    </Col>
    <Col xs={12} sm={6} md={3} lg={3} className="mb-4">
      <Card>
        <Card.Body>
          <Card.Title>Reviews</Card.Title>
          <Card.Text>
            <h3><FaStar /> {/* {reviewCount} */}</h3>
            Customer reviews and ratings
          </Card.Text>
        </Card.Body>
      </Card>
    </Col>
  </Row>

  {/* Second row for Quick Summary and Users (side by side) */}
  <Row className="mb-4">
    <Col xs={12} md={8} className="mb-4">
      <Card>
        <Card.Header>User Registrations This Week</Card.Header>
        <Card.Body>
          <div className="chart-container">
            <Line data={chartData} options={chartOptions} />
          </div>
        </Card.Body>
      </Card>
    </Col>
    
    {/* Quick Summary and Recent Activities side by side */}
    <Col xs={12} md={4} className="mb-4">
      <Row>
        {/* Quick Summary */}
        <Col xs={12} className="mb-4">
          <Card>
            <Card.Header>Quick Summary</Card.Header>
            <Card.Body>
              <ul>
                <li><strong>Total Users:</strong> {userCount}</li>
                <li><strong>Total Products:</strong> {productCount}</li>
                <li><strong>Total Orders:</strong> {/*{orderCount}*/}</li>
                <li><strong>Total Reviews:</strong> {/*{reviewCount}*/}</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Activities */}
        <Col xs={12} className="mb-4">
          <Card>
            <Card.Header>Recent Activities</Card.Header>
            <ListGroup variant="flush">
              {recentActivities.length > 0 ? recentActivities.map(activity => (
                <ListGroup.Item key={activity.id}>
                  <FaCalendarAlt /> {activity.description} {' '} {activity.timestamp.toLocaleTimeString()}
                </ListGroup.Item>
              )) : <ListGroup.Item>No activities for today.</ListGroup.Item>}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Col>
  </Row>

  <Users />
</Container>


  );
};

export default Dashboard;


