# Use Python 3.9.13 as the base image
FROM python:3.9.13

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR /app

# Copy the project files to the working directory
COPY .. .

# Install the project and its dependencies
RUN pip install .

#install poppler-utils
RUN apt-get update && apt-get install -y poppler-utils

# Expose port 8000
EXPOSE 8000

# Command to run the application with uvicorn in development mode
CMD ["sh", "-c", "python main.py"]
