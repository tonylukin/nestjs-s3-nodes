# Install
```bash
docker-compose up -d --build
docker-compose logs -f
```

# How test
```bash
curl -X POST http://localhost:3021/file-task \
   -H "Content-Type: application/json" \
   -d '{
         "fileCount": 3,
         "fileSize": 1,
         "s3Destination": "uploads"
       }'
```