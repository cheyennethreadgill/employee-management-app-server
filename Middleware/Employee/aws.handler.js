import aws from "aws-sdk";

export const awsHandler = () => {
  // Configure AWS SDK with environment variables
  const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION, // Specify the region where your S3 bucket is located
  });

  // Generate a unique key based on the file's original name
  function generateKey() {
    const origname = req.file.originalname;
    return `${origname}`;
  }
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: "", // Leave it empty for now
  };
  // Set the Key property using the generated key function
  uploadParams.Key = generateKey();
  uploadParams.Body = req.file.buffer;

  // Upload file to S3
  s3.upload(uploadParams, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to upload file to S3" });
    }
    // File uploaded successfully, return URL or other relevant info
    console.log({ url: data.Location });
  });
};
