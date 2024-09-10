// Categories.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Kurtas from './Kurtas/Kurtas';
import Sarees from './Sarees/Sarees';
import Loungewear from './LoungeWear/Loungewear';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const Categories = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();

  useEffect(() => {
    const fetchProducts = async () => {
      const db = getFirestore();
      const productsRef = collection(db, 'products');

      try {
        const q = query(productsRef, where('type', 'in', ['Kurtas', 'Sarees', 'Lounge wear']));
        const snapshot = await getDocs(q);
        
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllProducts(products);
      } catch (error) {
        setError(error);
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filterProducts = (type) => {
    return allProducts.filter(product => product.type === type);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error fetching products.</div>;

  const path = location.pathname.split('/').pop();

  if (path === 'kurtas') {
    return <Kurtas products={filterProducts('Kurtas')} />;
  } else if (path === 'sarees') {
    return <Sarees products={filterProducts('Sarees')} />;
  } else if (path === 'loungewear') {
    return <Loungewear products={filterProducts('Lounge wear')} />;
  }

  return <div>Invalid category.</div>;
};

export default Categories;
