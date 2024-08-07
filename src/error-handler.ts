export function errorHandler(err, req, res, next): void {
  console.error(err.stack);
  res.status(404).json({ message: err.message });
}
