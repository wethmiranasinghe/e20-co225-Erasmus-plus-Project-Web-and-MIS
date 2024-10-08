import React, { useEffect, useState } from "react";
import axios from "axios";
import { loggedInUser } from '../components/Header'; // Import logged-in user details
import '../components/Gallery.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // FontAwesome for icons
import { faPen, faEye, faTrash } from '@fortawesome/free-solid-svg-icons'; // Import necessary icons

/**
 * Fetch gallery items from the backend API.
 * Fetches the list of albums from the gallery API endpoint.
 * The results are sorted in descending order based on albumID.
 */
const fetchGallery = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/v1/gallery');
    return response.data.sort((a, b) => b.albumID - a.albumID); // albumID not albumId
  } catch (error) {
    console.error('Error fetching gallery:', error); 
    return [];
  }
};

/**
 * Gallery component for displaying a list of albums and providing functionality for adding, viewing, editing, and deleting items.
 */
const Gallery = () => {
  const [gallery, setGallery] = useState([]); 
  const [showForm, setShowForm] = useState(false); 
  const [file, setFile] = useState(null); 

   // Fetch and load the gallery when the component is first rendered
  useEffect(() => {
    const getGallery = async () => {
      const latestGallery = await fetchGallery(); 
      setGallery(latestGallery); 
    };

    getGallery(); 
  }, []); 

  // Toggles the display of the album addition form
  const toggleForm = () => {
    setShowForm(!showForm); 
  };

  // Handles file input change (for album cover image)
  const handleFileChange = (event) => {
    setFile(event.target.files[0]); 
  };

   /**
   * Handles form submission to add a new gallery item.
   * Sends the form data (album name, URL, cover image) to the backend.
   */
  const handleSubmit = async (event) => {
    event.preventDefault(); 
    const form = event.target;

       // Create a new FormData object to submit the form data
    const formData = new FormData();
    formData.append('albumName', form.albumName.value);
    formData.append('albumURL', form.albumURL.value);
    formData.append('albumCoverImage', file); 
    formData.append('albumCreatedBy', loggedInUser.username); // Pass logged-in user as the creator

    try {
      const response = await axios.post('http://localhost:8080/api/v1/gallery', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Log the response to debug if the item is being added correctly
      console.log('Gallery item added:', response.data);

      // Fetch the updated gallery list after adding the item
      const latestGallery = await fetchGallery(); 
      setGallery(latestGallery); 
      toggleForm(); // Close the form after successful submission
    } catch (error) {
      console.error('Error adding gallery item:', error); 
    }
  };

   /**
   * Handles the deletion of a gallery item by albumID.
   * Sends a DELETE request to remove the item from the backend.
   */
  const onDeleteClick = async (albumID) => {
    try {
      await axios.delete(`http://localhost:8080/api/v1/gallery/${albumID}`);
      const latestGallery = await fetchGallery();
      setGallery(latestGallery);
    } catch (error) {
      console.error("Error deleting gallery item:", error); 
    }
  }

  return (
    <>
    {/* Breadcrumb navigation for the page */}
      <div className="GalleryTitle">
        <h3>Gallery</h3>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="http://localhost:5173/"> 
                <span style={{ fontSize: 16}}>Home</span>
              </a>
            </li>
            <li className="breadcrumb-item active">
              <span style={{ fontSize: 16}}> News & Events</span>
            </li>
            <li className="breadcrumb-item active">
              <span style={{ fontSize: 16}}> Gallery</span>
            </li>
          </ol>
        </nav>
        </div>

        {/* Form toggle button for adding a new gallery item */}
        <div className="GalleryAdd">
        {loggedInUser.isLoggedIn && (
          <div>
            <button className="AddGalleryButton" onClick={toggleForm}>
              {showForm ? 'Close Form' : 'Add Album'}
            </button>
          </div>
        )}

        {/* Display the form when showForm is true */}
        {showForm && (
          <div className="add-gallery-form-container">
            <div className="add-gallery-form">
              <h2>Add Gallery Item</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="albumName">Name:</label>
                  <input type="text" placeholder="Enter Album Name" id="albumName" name="albumName" required />
                </div>
                <div className="form-group">
                  <label htmlFor="albumURL">URL:</label>
                  <input type="url" id="albumURL" placeholder="Enter Album URL" name="albumURL" required />
                </div>
                <div className="form-group">
                  <label htmlFor="albumCoverImage">Cover Image (Choose images with size less than 64 kB):</label>
                  <input type="file" id="albumCoverImage" name="albumCoverImage" onChange={handleFileChange} required />
                </div>
                <div className="form-buttons">
                  <button type="submit">Add Gallery Item</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      
      {/* Display the gallery items */}
      <div className="gallery-container">
        {gallery.map((item) => (
          <div key={item.albumID} className="gallery-tile">
            <img 
              src={`data:image/jpeg;base64,${item.albumCoverImage}`} 
              alt={item.albumName} 
            />
            <h2>{item.albumName}</h2>
            <a href={item.albumURL} target="_blank" rel="noopener noreferrer">Click here for more images</a>
            
            {/* Show edit, view, and delete buttons for logged-in users */}
            {loggedInUser.isLoggedIn && (
              <div className="gallery-actions">
                {/* <button className="actionButton"><FontAwesomeIcon icon={faPen}/></button>
                <button className="actionButton"><FontAwesomeIcon icon={faEye}/></button> */}
                <button className="actionButton" onClick={() => onDeleteClick(item.albumID)}><FontAwesomeIcon icon={faTrash} /></button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export { fetchGallery };
export default Gallery;
