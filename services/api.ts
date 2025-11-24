import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    // this.baseURL = process.env.EXPO_PUBLIC_API_URL || 'https://your-backend-api.com/api';

    this.baseURL = "http://localhost:8000/api"
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem('user');
          await AsyncStorage.removeItem('auth_token');
        }
        return Promise.reject(error);
      }
    );
  }

  async get(url: string, config?: AxiosRequestConfig) {
    return this.api.get(url, config);
  }

  async post(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.api.post(url, data, config);
  }

  async put(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.api.put(url, data, config);
  }

  async delete(url: string, config?: AxiosRequestConfig) {
    return this.api.delete(url, config);
  }

  setBaseURL(url: string) {
    this.baseURL = url;
    this.api.defaults.baseURL = url;
  }
}

export const apiService = new ApiService();
