import React, { useState, useRef, useEffect, useCallback } from 'react';
import { addFile, removeFile, getFiles } from '../services/FileService';
import '../styles/components/FileUploader.css';

const FileUploader = ({ onFilesUpdate }) => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  
  const updateFilesList = useCallback(async () => {
    const currentFiles = await getFiles();
    setFiles(currentFiles);
    if (onFilesUpdate) onFilesUpdate(currentFiles);
  }, [onFilesUpdate]);
  
  useEffect(() => {
    updateFilesList();
  }, [updateFilesList]);
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    await handleFileUpload(droppedFiles);
  };
  
  const handleFileInputChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    await handleFileUpload(selectedFiles);
  };
  
  const handleFileUpload = async (filesToUpload) => {
    for (const file of filesToUpload) {
      await addFile(file);
    }
    await updateFilesList();
  };
  
  const handleRemoveFile = async (fileId) => {
    await removeFile(fileId);
    await updateFilesList();
  };
  
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };
  
  const renderFilePreview = (file) => {
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';
    
    return (
      <div className="file-preview-item" key={file.id}>
        <div className="file-preview-content">
          {isImage ? (
            <img src={file.url} alt={file.name} className="file-thumbnail" />
          ) : isPDF ? (
            <div className="file-icon pdf-icon">PDF</div>
          ) : (
            <div className="file-icon">DOC</div>
          )}
          
          <div className="file-info">
            <div className="file-name">{file.name}</div>
            <div className="file-size">{formatFileSize(file.size)}</div>
          </div>
        </div>
        
        <button 
          className="remove-file-button"
          onClick={() => handleRemoveFile(file.id)}
        >
          Entfernen
        </button>
      </div>
    );
  };
  
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  return (
    <div className="file-uploader">
      <h3>Dateien hochladen</h3>
      
      <div 
        className={`dropzone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          multiple
          style={{ display: 'none' }}
        />
        
        <div className="dropzone-content">
          <div className="upload-icon">↑</div>
          <p>Dateien hierher ziehen oder klicken zum Auswählen</p>
          <p className="file-types">Unterstützte Formate: PDF, DOC, JPG, PNG</p>
        </div>
      </div>
      
      {files.length > 0 && (
        <div className="file-previews">
          {files.map(renderFilePreview)}
        </div>
      )}
    </div>
  );
};

export default FileUploader;