from .fileStorage import FileStorage
import tempfile
import boto3

class S3FileStorage(FileStorage):

    _instance = None

    s3 = None
    aws_bucket_name = None
    aws_region_name = None
    aws_access_key_id = None
    aws_secret_access_key = None

    async def saveFile(self, data: tempfile , suffix: str) -> str:
        # Generate a unique filename
        # Statistically improbable to have a collision, but not impossible (1 in 3.4 x 10^38 chance)
        import secrets
        filename = f"{secrets.token_hex(16)}.{suffix}"

        # Upload the file to S3 bucket
        self.s3.put_object(
            Key=filename,
            Body=data
        )

        # Return the S3 object URL
        return f"https://{self.aws_bucket_name}.s3.amazonaws.com/{filename}"
    
    async def removeFile(self, path: str):
        pass

    async def readFile(self, path: str)->bytes:
        pass

    async def fileExists(self, path: str)->bool:
        pass

    async def saveFileFromPath(self, path: str, suffix: str)->str:
        pass

    def __init__(self, aws_bucket_name, aws_region_name, aws_access_key_id, aws_secret_access_key):
        self.aws_bucket_name = aws_bucket_name
        self.aws_region_name = aws_region_name
        self.aws_access_key_id = aws_access_key_id
        self.aws_secret_access_key = aws_secret_access_key

        self.s3 = boto3.resource(
            bucket_name=self.aws_bucket_name,
            region_name=self.aws_region_name,
            aws_access_key_id=self.aws_access_key_id,
            aws_secret_access_key=self.aws_secret_access_key
        )

    def __new__(cls, aws_bucket_name, aws_region_name, aws_access_key_id, aws_secret_access_key):
        # If the instance does not exist, create it, otherwise return the instance
        if cls._instance is None:
            cls._instance = super(S3FileStorage, cls).__new__(cls)
            cls.__init__(cls, aws_bucket_name, aws_region_name, aws_access_key_id, aws_secret_access_key)
        return cls._instance