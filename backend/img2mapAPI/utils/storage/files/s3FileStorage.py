from .fileStorage import FileStorage
import tempfile
import boto3
import botocore

class S3FileStorage(FileStorage):

    _instance = None

    s3 = None
    bucket = None
    aws_bucket_name = None
    aws_region_name = None
    aws_access_key_id = None
    aws_secret_access_key = None

    async def saveFile(self, data: tempfile , suffix: str) -> str:
        # Generate a unique filename
        import uuid
        object_key = f"{uuid.uuid4()}.{suffix}"

        # Upload the file to S3 bucket
        self.bucket.put_object(
            Key=object_key,
            Body=data
        )

        # Return the S3 object URL
        return object_key
    
    async def removeFile(self, object_key: str):
        # Remove the file from the S3 bucket
        self.s3.Object(self.aws_bucket_name, object_key).delete()

    async def readFile(self, object_key: str)->bytes:
        # Read the file from the S3 bucket and return it as bytes
        response = self.bucket.Object(object_key).get()
        data = response['Body'].read()

        return data

    async def fileExists(self, object_key: str)->bool:
        # Thefted from https://stackoverflow.com/a/33843019
        # Try to load the object from S3 bucket using key, if it fails with 404 error, return False
        try: 
            self.s3.Object(self.aws_bucket_name, object_key).load()
        except botocore.exceptions.ClientError as e:
            if e.response['Error']['Code'] == "404":
                return False
            else:
                raise

        return True

    async def saveFileFromPath(self, path: str, suffix: str)->str:
        # This is thefted from localFileStorage.saveFileFromPath
        with open(path, "rb") as file:
            data = file.read()
            return await self.saveFile(data, suffix)

    def __init__(self, aws_bucket_name, aws_region_name, aws_access_key_id, aws_secret_access_key):
        # Store the provided credentials
        self.aws_bucket_name = aws_bucket_name
        self.aws_region_name = aws_region_name
        self.aws_access_key_id = aws_access_key_id
        self.aws_secret_access_key = aws_secret_access_key

        # Create an S3 resource object using the provided credentials
        self.s3 = boto3.resource(
            service_name='s3',
            region_name=self.aws_region_name,
            aws_access_key_id=self.aws_access_key_id,
            aws_secret_access_key=self.aws_secret_access_key
        )

        # Create a reference to the specified bucket
        self.bucket = self.s3.Bucket(self.aws_bucket_name)

    def __new__(cls, aws_bucket_name, aws_region_name, aws_access_key_id, aws_secret_access_key):
        # If the instance does not exist, create it, otherwise return the instance
        if cls._instance is None:
            cls._instance = super(S3FileStorage, cls).__new__(cls)
            cls.__init__(cls, aws_bucket_name, aws_region_name, aws_access_key_id, aws_secret_access_key)
        return cls._instance