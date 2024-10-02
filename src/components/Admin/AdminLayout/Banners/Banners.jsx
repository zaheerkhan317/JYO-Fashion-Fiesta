import React, { useState, useEffect, useCallback } from 'react';
import { getFirestore, collection, addDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Button, Card, Container, Row, Col, Alert, Form, Spinner } from 'react-bootstrap';


const Banners = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [banners, setBanners] = useState([]);
  const [error, setError] = useState(null);
  const [redirectUrls, setRedirectUrls] = useState([]);

  const db = getFirestore();
  const storage = getStorage();

  const fetchBanners = useCallback(async () => {
    const db = getFirestore();
    const bannersRef = collection(db, 'banners');
  
    try {
      const querySnapshot = await getDocs(bannersRef);
      const fetchedBanners = querySnapshot.docs.map(doc => doc.data().imageUrl);
      setBanners(fetchedBanners);
    } catch (error) {
      console.error('Error fetching banners:', error);
      setError('Error fetching banners');
    }
  }, []); // Empty array to memoize the function
  
  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // Handle file selection
  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleUrlChange = (index, value) => {
    const newUrls = [...redirectUrls];
    newUrls[index] = value;
    setRedirectUrls(newUrls);
  };

  // Upload files to Firebase Storage and save URLs to Firestore
  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select files first');
      return;
    }

    setUploading(true);
    const urls = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const storageRef = ref(storage, `banners/${file.name}`);
        
        // Upload file to Firebase Storage
        await uploadBytes(storageRef, file);
        
        // Get file URL
        const imageUrl = await getDownloadURL(storageRef);
        urls.push({ imageUrl, fileName: file.name, redirectUrl: redirectUrls[i] }); // Include redirect URL
      }

      // Save URLs to Firestore
      for (const { imageUrl, fileName, redirectUrl } of urls) {
        await addDoc(collection(db, 'banners'), { imageUrl, fileName, redirectUrl });
      }

      setFiles([]);
      setRedirectUrls([]); // Clear the URLs after upload
      setError(null);
      alert('Banners uploaded successfully');
      fetchBanners(); // Refresh banner list
    } catch (error) {
      console.error('Error uploading banners:', error);
      setError('Error uploading banners');
    } finally {
      setUploading(false);
    }
  };

  // Delete a banner
  const handleDelete = async (id, fileName) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      setUploading(true);

      try {
        // Delete banner from Firestore
        await deleteDoc(doc(db, 'banners', id));

        // Construct file reference in Firebase Storage
        const storageRef = ref(storage, `banners/${fileName}`);
        
        // Delete file from Firebase Storage
        await deleteObject(storageRef);

        alert('Banner deleted successfully');
        fetchBanners(); // Refresh banner list
      } catch (error) {
        console.error('Error deleting banner:', error);
        setError('Error deleting banner');
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <Container className="mt-5">
      <h2 className="mb-4 text-center">Manage Banners</h2>

      {/* Upload Section */}
        <Card className="mb-4 shadow rounded card-small mx-auto" style={{ maxWidth: '400px' }}>
            <Card.Body>
                <Card.Title className="text-center mb-4">Upload Banners</Card.Title>
                <Form>
                <Form.Group controlId="formFileMultiple">
                    <Form.Label className="fw-bold">Select Files</Form.Label>
                    <Form.Control
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="mb-3"
                    />
                </Form.Group>
                {files.map((file, index) => (
                  <Form.Group key={index} controlId={`formUrl-${index}`} className="mb-3">
                    <Form.Label className="fw-bold">Redirect URL for {file.name}</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter redirect URL"
                      onChange={(e) => handleUrlChange(index, e.target.value)}
                    />
                  </Form.Group>
                ))}
                <Button
                    variant="warning"
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-100"
                >
                    {uploading ? <Spinner animation="border" size="sm" /> : 'Upload'}
                </Button>
                {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                </Form>
            </Card.Body>
        </Card>


      {/* Existing Banners Section */}
      <h2 className="m-4 p-5">Existing Banners</h2>
      {banners.length > 0 ? (
        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {banners.map((banner) => (
            <Col key={banner.id}>
              <Card className="shadow rounded">
                <Card.Img variant="top" src={banner.imageUrl} alt="Banner" className="banner-img" />
                <Card.Body className="d-flex justify-content-between align-items-center">
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(banner.id, banner.fileName)}
                  >
                    Delete
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Alert variant="info" className="text-center mt-4">No banners available</Alert>
      )}
    </Container>
  );
};

export default Banners;
