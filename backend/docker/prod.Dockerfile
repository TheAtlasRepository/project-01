# Stage 1: Requirements generation
FROM python:3.9-slim as requirements

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       gcc \
       libpq-dev \
       curl \
    && rm -rf /var/lib/apt/lists/*

# Install pip-tools
RUN pip install pip-tools

# Set the working directory in the container
WORKDIR /app

# Copy the pyproject.toml file
COPY ../pyproject.toml /app/

# Generate requirements.txt
RUN pip-compile --output-file=requirements.txt pyproject.toml

# Stage 2: Build environment
FROM python:3.9-slim as build

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       gcc \
       libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Copy the generated requirements.txt
COPY --from=requirements /app/requirements.txt /app/requirements.txt

# Install dependencies
RUN python -m venv /venv
ENV PATH="/venv/bin:$PATH"
RUN pip install --no-cache-dir --upgrade pip \ 
    && pip install build\
    && pip install --no-cache-dir -r requirements.txt

# Copy the project files
COPY .. /app/

# Check and build in /app directory
RUN python -m build . -o dist/



# Stage 3: Production environment
FROM python:3.9-slim as production

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       libpq-dev \
       poppler-utils\
    && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Copy the application code from the build stage
COPY --from=build /app /app

RUN if [ ! -f /app/.env ] && [ -f .env ]; then cp .env /app/; fi
RUN pip install dist/*.whl

# Expose port
EXPOSE $PORT

# Command to run the application
CMD ["sh", "-c", "python main.py --port $PORT --mode 'prod'"]
