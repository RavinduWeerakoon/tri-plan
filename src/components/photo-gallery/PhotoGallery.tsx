import './style.css'
import { supabaseClient } from "../../utility/supabaseClient";
import { useEffect, useState } from 'react';
import { Box, Button, Text, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, useDisclosure } from '@chakra-ui/react';
import ImageUpload from '../image-upload/ImageUpload';

import { useParsed } from "@refinedev/core";


const PhotoGallery = () => {

  const params = useParsed();
  const project_id = params.params?.projectId ?? '';
  console.log(project_id)
  const [photos, setPhotos] = useState<{ src: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [uploadComplete, setUploadComplete] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data: files, error } = await supabaseClient
          .storage
          .from('project-img')// Your bucket name
          .list(`gallery/${project_id}`, { limit: 1000 }); // Adjust the limit if needed

        if (error) throw error;

        const photoUrls = files.map(file => ({
          src: `https://sacpcuhbfmpwrkbaxdmu.supabase.co/storage/v1/object/public/project-img/gallery/${project_id}/${file.name}`,  
        }));

        setPhotos(photoUrls);
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [uploadComplete]);

  const handleUpload = () => {
    setUploadComplete(prev => !prev);
    onClose();
  };

  if (loading) return <div>Loading...</div>;
  
    return (
    <div >
      <div className='upload-button'>
        <Button onClick={onOpen} colorScheme="blue">
          Upload
        </Button>
        <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modal Title</ModalHeader>
          <ModalBody>
            <ImageUpload project_id={project_id} type='gallery'/>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleUpload}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      </div>
      <div className="gallery">
        {photos.map((items)=>{
          return(
            <div className="pics">
                  <img src={items.src} style={{width: "100%"}}/>
              </div>
          )
        })}
      </div>
    </div>
  )
}

export default PhotoGallery
