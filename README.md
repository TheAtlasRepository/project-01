# Image/PDF 2 Map

>> **TODO:** Add project description.

## Project requirements & development server setup

**Requirements:**

- **Install Miniconda:**
   Download and install Miniconda from [Miniconda website](https://docs.conda.io/en/latest/miniconda.html).

- **Acquire a mapbox token**
   Create an account or login on this link [Mapbox Token](https://account.mapbox.com/access-tokens/). Then copy the `Default public token` keep it saved for later.

### Automatic setup dev server and enviroment (windows)

---

#### Docker build

First you will have to create a `.env.local` file in the directory ./frontend, it should look like `.env.example`

To run you you will have to [Download Docker compose](https://docs.docker.com/compose/install/), recomend docker desktop.

Now open a terminal, make sure you are in the project root folder ({localpath}/{projectName}/). Run This cmd for dev `docker-compose -f docker-compose.dev.yml up --build` to run the development version of the application.

> **IF you want to run prod version:**
>
> Change the .env.local to .env
>
> Run this cmd ```docker-compose -f docker-compose.prod.yml up --build```, Note this will take a notably longer build time.
>
> The terminal link is not correct in this instance and the website is located at [http://localhost](http://localhost). and the API is unreachable for all exept the website.

#### Dev Startup Script

First you will need to locate the `startup.bat` in the `\` (root) directory of the project. When you have located it you have three options depending on youre case.

**Options**:

1. If in *fileexplorer*, **click and start** the `startup.bat` file like any other program.
2. If in *IDE*, open the terminal and type `run startup.bat`
3. If in *VsCode* with batchscript runner, select the script in the internal fileexplorer, locate the playbytton in upper right corner, below `- [] x` of the application. Press the button.

>**Note:** when the script is running, if first time install:
>
>> 1. The script may exit if you do not have conda installed
>> 2. You may be promted to provide the `Mapbox Default public token`, paste and enter.
>> 3. you mey be promted with one `Y/n` in the terminal. type `y`, then enter.
>

You are now done with the automatic startup, and will see more terminals appear, these are the local servers, in time the browser will open two tabs: **the page** & **Backend API documentation**.

### Manual setup in commandline

---

1. **Create a Conda Environment:**

   Need to be in the directory you want to set the project up in!

   ```bash
    conda create --name YOUR_ENV_NAME

    conda activate YOUR_ENV_NAME

    conda install yarn

    conda install pip

    conda install -c conda-forge poppler
   ```

2. **To run Backend**

   ```bash
   cd backend

   pip install -r requirements.txt

   uvicorn main:app --reload
   ```

> **Note:** Open a new terminal to progress, remember to activate the conda enviroment in this terminal too.

<!-- markdownlint-disable MD029 -->
3. **Set up Mapbox API key**
<!-- markdownlint-enable MD029 -->
   In directory "frontend", create a file named `.env.local`.
   Add and modify the following line:

   ```bash
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN="Your Mapbox Default public token"
   ```
<!-- markdownlint-disable MD029 -->
4. **To Run Frontend**
<!-- markdownlint-enable MD029 -->
   ```bash
   cd frontend

   yarn install

   yarn dev
   ```
