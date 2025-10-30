// Get port from environment variable or use default
const PORT = process.env.PORT || 5000;

// Start server - IMPORTANT: Listen on 0.0.0.0 for Docker
app.listen(PORT, '0.0.0.0', () => {
  console.log(✅ Backend server running on port ${PORT});
  console.log(📍 Server URL: http://0.0.0.0:${PORT});
  console.log(🌍 Environment: ${process.env.NODE_ENV || 'development'});
});

// Add basic error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
