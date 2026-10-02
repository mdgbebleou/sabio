import app from './app';

const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server running locally on http://localhost:${PORT}`);
});