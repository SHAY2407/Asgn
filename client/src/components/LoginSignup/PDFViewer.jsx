import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@mui/material';

const PDFViewer = ({ pdfUrl }) => {
  if (!pdfUrl) {
    return (
      <Typography variant="body1" style={{ marginTop: '20px' }}>
        No PDF available to display.
      </Typography>
    );
  }

  return (
    <div className="pdf-viewer-section" style={{ marginTop: '20px' }}>
      <Typography variant="h6">Generated PDF:</Typography>
      <iframe
        src={pdfUrl}
        title="Generated Assignment PDF"
        width="120%"
        height="540px"
        style={{ border: 'none', marginTop: '10px' }}
      ></iframe>
    </div>
  );
};

PDFViewer.propTypes = {
  pdfUrl: PropTypes.string, // Prop to pass the URL of the PDF
};

export default PDFViewer;