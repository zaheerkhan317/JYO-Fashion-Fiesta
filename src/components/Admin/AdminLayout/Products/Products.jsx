import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Form, Button, Col, Row, Container, Modal, Table } from 'react-bootstrap';
import { db, storage } from '../../../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { addDoc, updateDoc, getDoc, setDoc, collection, doc, Timestamp, onSnapshot, deleteDoc} from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import './Products.css';

const getISTDate = (date) => {
  const options = {
    timeZone: 'Asia/Kolkata', // IST timezone
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };
  return new Intl.DateTimeFormat('en-IN', options).format(date);
};

const generateUniqueId = async () => {
  const id = Math.floor(Math.random() * 9000000000) + 1000000000; // Generate a 10-digit number

  const productRef = doc(db, 'products', id.toString());
  const docSnap = await getDoc(productRef);

  if (docSnap.exists()) {
    // If the ID already exists, generate a new one
    return generateUniqueId();
  }

  return id.toString();
};


const Products = () => {
  const [formData, setFormData] = useState({
    brand: '',
    itemName: '',
    type: '',
    description: '',
    cost: '',
    discountValue: '',
    discountedPrice: '',
    sizes: [],
    colours: [],
    photos: {}
  });

  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null); // Store the product being edited
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      const productsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsList);
    });
  
    // Cleanup function to unsubscribe from updates
    return () => {
      unsubscribe();
    };
  }, []);
  

  useEffect(() => {
    if (formData.cost) {
      setShowDiscountInput(true);
    } else {
      setShowDiscountInput(false);
      setFormData(prev => ({
        ...prev,
        discountValue: '',
        discountedPrice: ''
      }));
    }
  }, [formData.cost]);

  useEffect(() => {
    if (formData.discountValue && formData.cost) {
      const discount = parseFloat(formData.discountValue);
      const originalPrice = parseFloat(formData.cost);
      const discountedPrice = originalPrice - (originalPrice * (discount / 100));
      setFormData(prev => ({
        ...prev,
        discountedPrice: discountedPrice.toFixed(2)
      }));
    }
  }, [formData.discountValue, formData.cost]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && name === 'colours') {
      const colour = value;
      setFormData(prev => ({
        ...prev,
        colours: checked
          ? [...prev.colours, colour]
          : prev.colours.filter(col => col !== colour)
      }));
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        sizes: checked
          ? [...formData.sizes, value]
          : formData.sizes.filter(size => size !== value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handlePhotoChange = (e) => {
    const { name, files } = e.target;
    const fileArray = Array.from(files);
  
    setFormData(prev => ({
      ...prev,
      photos: {
        ...prev.photos,
        [name]: fileArray
      }
    }));
  };


  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        // Delete the product from Firestore
        await deleteDoc(doc(db, 'products', productId));
  
        // Optionally: Remove photos from Firebase Storage
        await deletePhotosFromStorage(productId);
  
        // Update the local state to remove the deleted product
        setProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
      } catch (error) {
        console.error("Error deleting product: ", error);
      }
    }
  };


  const deletePhotosFromStorage = async (productId) => {
    // Assuming you have a function to get the list of photo URLs from Firestore
    const product = products.find(p => p.id === productId);
    if (product) {
      const photoUrls = product.photos;
      for (const colour in photoUrls) {
        for (const photoUrl of photoUrls[colour]) {
          const photoRef = ref(storage, photoUrl);
          await deleteObject(photoRef);
        }
      }
    }
  };



  const updateFirestoreAfterPhotoRemoval = async (productId, updatedPhotos) => {
    try {
      
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        photos: updatedPhotos
      });


    } catch (error) {
      console.error("Error updating Firestore: ", error);
    }
  };


  const removePhotoFromStorage = async (productId, photoUrl) => {
    try {
      // Extract the file name from the URL
      const urlParts = photoUrl.split('/');
      const encodedFileName = urlParts[urlParts.length - 1].split('?')[0];
      const fileName = decodeURIComponent(encodedFileName);
  
      // Create a reference to the file in Firebase Storage
      const photoRef = ref(storage, `${fileName}`);
  
      // Delete the file
      await deleteObject(photoRef);
      
      console.log(`Photo removedPhotoFromStorage from storage`);
    } catch (error) {
      console.error('Error removing photo from storage:', error);
    }
  };
  


  const removePhoto = async (colour, index) => {
    const photoUrlToRemove = formData.photos[colour][index];
    const updatedPhotos = { ...formData.photos };
  
    // Remove the photo URL from the updatedPhotos
    updatedPhotos[colour] = updatedPhotos[colour].filter((_, i) => i !== index);
  try{
    // Update Firestore
    await updateFirestoreAfterPhotoRemoval(selectedProduct.id, updatedPhotos);
    console.log("photo removed successfully in firstore database");
    // Update local state
    

    await removePhotoFromStorage(selectedProduct.id, photoUrlToRemove);

    setFormData(prev => ({
      ...prev,
      photos: updatedPhotos
    }));
    
    console.log('Photo removed successfully in storage');
  } catch (error) {
    console.error('Error removing photo:', error);
  }
  };
  


  // Function to upload photos with productId as part of the path
  const uploadPhotos = async (photos, productId) => {
    const photoUrls = {};
    const uploadPromises = [];
  
    Object.keys(photos).forEach(colour => {
      photos[colour].forEach(photo => {
        if (typeof photo === 'string') {
          // If it's a URL, just keep it
          photoUrls[colour] = photoUrls[colour] || [];
          photoUrls[colour].push(photo); // Keep existing URL
        } else if (photo && photo.name) {
          // If it's a file, upload it to Firebase Storage
          const photoRef = ref(storage, `product_photos/${productId}/${photo.name}`);
          const uploadTask = uploadBytes(photoRef, photo);
  
          uploadPromises.push(
            uploadTask.then(async () => {
              const url = await getDownloadURL(photoRef);
              photoUrls[colour] = photoUrls[colour] || [];
              photoUrls[colour].push(url);
            })
          );
        } else {
          console.error('Photo is undefined or has no name', photo);
        }
      });
    });
  
    await Promise.all(uploadPromises);
    return photoUrls;
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const productId = selectedProduct ? selectedProduct.id : await generateUniqueId();
      console.log(productId);
      const photoUrls = await uploadPhotos(formData.photos, productId);

      if (selectedProduct) {
        const productRef = doc(db, 'products', productId);
        await updateDoc(productRef, {
          brand: formData.brand,
          itemName: formData.itemName,
          type: formData.type,
          description: formData.description,
          cost: formData.cost,
          discountValue: formData.discountValue, // Store discount percentage
          discountedPrice: formData.discountedPrice,
          quantityLeft: formData.quantityLeft,
          sizes: formData.sizes,
          colours: formData.colours,
          photos: { ...photoUrls } // Replace photos with only existing + new ones
        });
        setIsUpdate(true);
      console.log("Product updated successfully!");


      } else {
        // Add new product
       
        await setDoc(doc(db, 'products', productId), {
          id: productId,
          brand: formData.brand,
          itemName: formData.itemName,
          type: formData.type,
          description: formData.description,
          cost: formData.cost,
          discountValue: formData.discountValue,
          discountedPrice: formData.discountedPrice,
          quantityLeft: formData.quantityLeft,
          sizes: formData.sizes,
          colours: formData.colours,
          photos: photoUrls,
          createdAt: getISTDate(new Date()).toString(),
        });
        setIsUpdate(false);
        console.log("Product added successfully!");
      }

      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);
      handleCloseModal();

      // Reset form
      resetForm();

    } catch (e) {
      console.error("Error adding/updating product: ", e);
    }
  };

  const handleEdit = (product) => {
    
    setFormData({
      brand: product.brand,
      itemName: product.itemName,
      type: product.type,
      description: product.description,
      cost: product.cost,
      discountValue: product.discountValue,
      discountedPrice: product.discountedPrice,
      quantityLeft: product.quantityLeft,
      sizes: product.sizes,
      colours: product.colours,
      photos: product.photos
    });

    setSelectedProduct(product);
    setIsUpdate(true);
    setShowModal(true);

  };

  const handleShowModal = () => setShowModal(true);
  
  const handleCloseModal = () => {
    setShowModal(false);
    // Optionally reset formData or selectedProduct if needed
    setFormData({
      brand: '',
      itemName: '',
      type: '',
      description: '',
      cost: '',
      discountValue: '',
      sizes: [],
      colours: [],
      photos: {}
    });
    setSelectedProduct(null); // Reset selected product for edit mode
  };
  

  const resetForm = () => {
    setFormData({
      brand: '',
      itemName: '',
      type: '',
      description: '',
      cost: '',
      discountValue: '',
      discountedPrice: '',
      sizes: [],
      colours: [],
      photos: {}
    });
    setSelectedProduct(null);
  };

  return (
    <Container fluid>
  <h1 className="mb-4 text-center">Products</h1>

  {/* Button to open the modal */}
  <div className="d-flex justify-content-center mb-4">
    <Button variant="primary" onClick={handleShowModal}>
      Add Product
    </Button>
  </div>

  {/* Modal for Adding or Editing Product */}
  <Modal show={showModal} onHide={handleCloseModal} className="custom-modal" centered>
    <Modal.Header closeButton>
      <Modal.Title>{selectedProduct ? 'Edit Product' : 'Add Product'}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form onSubmit={handleSubmit}>
        <Row>
          {/* Brand */}
          <Col xs={12} md={6} className='mb-4'>
            <Form.Group controlId="formBrand">
              <Form.Label>Brand</Form.Label>
              <Form.Control
                as="select"
                name="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              >
                <option value="">Select brand</option>
                <option value="Adidas">Adidas</option>
                <option value="Puma">Puma</option>
                <option value="Bata">Bata</option>
              </Form.Control>
            </Form.Group>
          </Col>

          {/* Item Name */}
          <Col xs={12} md={6} className='mb-4'>
            <Form.Group controlId="formItemName">
              <Form.Label>Item Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter item name"
                name="itemName"
                value={formData.itemName}
                onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={6} className='mb-4'>
            <Form.Group controlId="formItemDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter item name"
                name="itemName"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>
          </Col>

          {/* Type */}
          <Col xs={12} md={6} className='mb-4'>
            <Form.Group controlId="formType">
              <Form.Label>Type</Form.Label>
              <Form.Control
                as="select"
                name="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="">Select type</option>
                <option value="Kurtas">Kurtas</option>
                <option value="Sarees">Sarees</option>
                <option value="Lounge wear">Lounge wear</option>
              </Form.Control>
            </Form.Group>
          </Col>

        </Row>

        <Row>
          {/* Cost */}
          <Col xs={12} md={6} className='mb-4'>
            <Form.Group controlId="formCost">
              <Form.Label>Cost</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter cost"
                name="cost"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                onWheel={(e) => e.target.blur()} // Prevent changing value on scroll
              />
              {showDiscountInput && (
                <Form.Text className="text-muted">
                  <strong>Want to apply a discount?</strong>
                </Form.Text>
              )}
            </Form.Group>
          </Col>
          
          {showDiscountInput && (

          <Col xs={12} md={6} className='mb-4'>
              <Form.Group controlId="formDiscount">
                <Form.Label>Discount (%)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter discount percentage"
                  name="discountValue"
                  value={formData.discountValue}
                  onChange={handleChange}
                  onWheel={(e) => e.target.blur()} // Prevent changing value on scroll
                />
                {formData.discountedPrice && (
                  <Form.Text className="mt-2">
                    <strong>Price after discount:</strong> ${formData.discountedPrice}
                  </Form.Text>
                )}
              </Form.Group>
            </Col>
             )}
        </Row>      

          <Form.Group as={Row} controlId="formQuantityLeft">
            <Form.Label column sm={2}>Quantity Left</Form.Label>
            <Col sm={10} md={4} className='mb-4'>
              <Form.Control
                type="number"
                placeholder="Enter quantity left"
                name="quantityLeft"
                value={formData.quantityLeft}
                onChange={(e) => setFormData({ ...formData, quantityLeft: e.target.value })}
                onWheel={(e) => e.target.blur()} // Prevent changing value on scroll
              />
            </Col>
          </Form.Group>

        {/* Sizes */}
        <Form.Group controlId="formSizes">
          <Form.Label>Size</Form.Label>
          <div className="d-flex flex-wrap mb-4">
            {['S', 'M', 'L', 'XL'].map(size => (
              <Form.Check
                inline
                key={size}
                label={size}
                type="checkbox"
                name="sizes"
                value={size}
                checked={formData.sizes.includes(size)}
                onChange={(e) => {
                  const checkedSizes = formData.sizes.includes(size)
                    ? formData.sizes.filter(s => s !== size)
                    : [...formData.sizes, size];
                  setFormData({ ...formData, sizes: checkedSizes });
                }}
              />
            ))}
          </div>
        </Form.Group>

        {/* Colours */}
        <Form.Group controlId="formColours">
          <Form.Label>Colours</Form.Label>
          <div className="d-flex flex-wrap mb-4">
            {['Red', 'Green', 'Blue', 'Black', 'White', 'Yellow', 'Purple', 'Orange'].map(colour => (
              <div key={colour} className="mb-3">
                {formData.photos[colour] && formData.photos[colour].length > 0 && (
                  <div className="mb-2">
                    {formData.photos[colour].map((url, index) => (
                      <div key={index} style={{ position: 'relative', display: 'inline-block', marginRight: '5px' }}>
                        <img
                          src={url}
                          alt={`${colour} preview`}
                          style={{ width: '100px', height: 'auto' }}
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(colour, index)}
                          style={{
                            position: 'absolute',
                            top: '0',
                            right: '0',
                            backgroundColor: 'red',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <Form.Check
                  inline
                  label={colour}
                  type="checkbox"
                  name="colours"
                  value={colour}
                  checked={formData.colours.includes(colour)}
                  onChange={handleChange}
                />
                {formData.colours.includes(colour) && (
                  <Form.Control
                    type="file"
                    name={colour}
                    multiple
                    onChange={handlePhotoChange}
                  />
                )}
              </div>
            ))}
          </div>
        </Form.Group>

        <div className="d-flex justify-content-end mx-5">
          <Button variant="primary" type="submit" className='mx-2'>
            {selectedProduct ? 'Update Product' : 'Add Product'}
          </Button>
          <Button variant="secondary" onClick={handleCloseModal} className="mr-2 mx-2">
            Cancel
          </Button>
        </div>
      </Form>
    </Modal.Body>
  </Modal>

  {/* Product List */}
  <h2 className="mt-5 text-center">Product List</h2>
  <Table responsive striped bordered hover className="text-center">
    <thead>
      <tr>
        <th>ProductId</th>
        <th>Brand</th>
        <th>Item Name</th>
        <th>Description</th>
        <th>Type</th>
        <th>Cost</th>
        <th>Discount %</th>
        <th>After Discount</th>
        <th>Quantity Left</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {products.map((product) => (
        <tr key={product.id}>
          <td>{product.id}</td>
          <td>{product.brand}</td>
          <td>{product.itemName}</td>
          <td>{product.description}</td>
          <td>{product.type}</td>
          <td>{product.cost}</td>
          <td>{product.discountValue}</td>
          <td>{product.discountedPrice}</td>
          <td>{product.quantityLeft}</td>
          <td>
            <Button variant="warning" onClick={() => handleEdit(product)}>Edit</Button>{' '}
            <Button variant="danger" onClick={() => handleDelete(product.id)}>Delete</Button>
          </td>
        </tr>
      ))}
    </tbody>
  </Table>

  {/* Success Popup */}
  {showSuccessPopup && (
    <Modal show={showSuccessPopup} onHide={() => setShowSuccessPopup(false)} centered>
      <Modal.Body>
        <h4 className="text-success text-center">Success!</h4>
        <p className="text-center">Product has been {isUpdate ? 'updated' : 'added'} successfully!</p>
      </Modal.Body>
    </Modal>
  )}
</Container>

  );
};

export default Products;
