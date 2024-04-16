import axios, { AxiosResponse, AxiosError } from "axios";

interface ProjectResponse {
  id: number;
  name: string;
}

interface MarkerPairResponse {
  Project: {
    id: number;
  };
  Point: {
    id: number;
    inProjectId: number;
  };
}

interface ErrorResponse {
  detail: string;
}

// Base URL for the backend API from .env
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

let hasMadeProjectApiCall = false;

// A helper function to extract error message
function getErrorMessage(error: AxiosError<ErrorResponse>): string {
  return error.response?.data.detail || "Something went wrong!";
}

export const addProject = async (name: string): Promise<ProjectResponse> => {
  if (hasMadeProjectApiCall) return Promise.reject("API call already made");
  hasMadeProjectApiCall = true;
  try {
    const response: AxiosResponse<ProjectResponse> = await axios.post(
      `${BASE_URL}/project/`,
      { name }
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error as AxiosError<ErrorResponse>));
  }
};

export const addMarkerPair = async (
  projectId: number,
  lat: number,
  lng: number,
  col: number,
  row: number
): Promise<MarkerPairResponse> => {
  try {
    const response: AxiosResponse<MarkerPairResponse> = await axios.post(
      `${BASE_URL}/project/${projectId}/point`,
      {
        lat,
        lng,
        col,
        row,
        name: "",
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error as AxiosError<ErrorResponse>));
  } finally {
    console.log("Marker pair added");
  }
};

// uploadImage
export const uploadImage = async (
  projectId: number,
  formData: FormData
): Promise<void> => {
  try {
    await axios.post(`${BASE_URL}/project/${projectId}/image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error) {
    throw new Error(getErrorMessage(error as AxiosError<ErrorResponse>));
  } finally {
    console.log("Image uploaded");
  }
};

// initalGeorefimage /project/{projectId}/georef/initial
export const initalGeorefimage = async (projectId: number): Promise<void> => {
  try {
    // Add image capture logic here later
    await axios.get(`${BASE_URL}/project/${projectId}/georef/initial`);
    //response type blob
    const response = await fetch(
      `${BASE_URL}/project/${projectId}/georef/initial`
    );
    const blob = await response.blob();
    // Directly create object URL from the blob
    const objectURL = URL.createObjectURL(blob);
    localStorage.setItem("tiffUrl", objectURL);
  } catch (error) {
    throw new Error(getErrorMessage(error as AxiosError<ErrorResponse>));
  } finally {
    console.log("Initial georefimage done");
  }
};

/**
 * DELETE /project/{projectId}
 * Deletes a project and its related data
 * @param projectId - The ID of the project to delete
 * @returns {Promise<void>} A Promise that resolves when the project is deleted successfully
 * @throws {Error} Will throw an error if the request fails
 */
export const deleteProject = async (projectId: number): Promise<void> => {
  try {
    await axios.delete(`${BASE_URL}/project/${projectId}`, {
      headers: {
        accept: "application/json",
      },
    });
  } catch (error) {
    throw new Error(getErrorMessage(error as AxiosError<ErrorResponse>));
  } finally {
    console.log("Project deleted");
  }
};

/**
 * DELETE /project/{projectId}/point
 * Deletes all markers from a project
 * @param projectId - The ID of the project to delete markers from
 * @returns {Promise<void>} A Promise that resolves when all markers are deleted successfully
 * @throws {Error} Will throw an error if the request fails
 */
export const deleteAllMarkers = async (projectId: number): Promise<void> => {
  try {
    await axios.delete(`${BASE_URL}/project/${projectId}/point`, {
      headers: {
        accept: "application/json",
      },
    });
  } catch (error) {
    throw new Error(getErrorMessage(error as AxiosError<ErrorResponse>));
  } finally {
    console.log("All markers deleted");
  }
};

/**
 * DELETE /project/{projectId}/point/{pointId}
 * Deletes a marker pair from a project
 * @param projectId - The ID of the project to delete the marker pair from
 * @param pointId - The ID of the marker pair to delete
 */
export const deleteMarkerPair = async (projectId: number, pointId: number): Promise<void> => {
  try {
    await axios.delete(`${BASE_URL}/project/${projectId}/point/${pointId}`, {
      headers: {
        accept: "application/json",
      },
    });
  } catch (error) {
    throw new Error(getErrorMessage(error as AxiosError<ErrorResponse>));
  } finally {
    console.log("Marker pair deleted");
  }
};

/**
 * POST /converter/cropPng
 * Crops a PNG using the provided coordinates and image.
 *
 * @param {FormData} formData - FormData object containing 'file', blob, 'filename'
 * @param {number} p1x - The x-coordinate of the first point.
 * @param {number} p1y - The y-coordinate of the first point.
 * @param {number} p2x - The x-coordinate of the second point.
 * @param {number} p2y - The y-coordinate of the second point.
 * @returns {Promise<void>} A Promise that resolves when the image is cropped successfully.
 * @throws {Error} Will throw an error if the request fails.
 */
export const cropImage = async (formData: FormData, p1x: number, p1y: number, p2x: number, p2y: number): Promise<string> => {
  try {
    const response = await axios.post(`${BASE_URL}/converter/cropPng?p1x=${p1x}&p1y=${p1y}&p2x=${p2x}&p2y=${p2y}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      responseType: 'blob'
    });

    // Convert the response data to a Blob, create a Blob URL and return the URL
    const newBlob = new Blob([response.data], { type: 'image/png' });
    const blobUrl = URL.createObjectURL(newBlob);
    return blobUrl;

  } catch (error) {
    throw new Error(getErrorMessage(error as AxiosError<ErrorResponse>));
  } finally {
    console.log("Image cropped");
  }
};
