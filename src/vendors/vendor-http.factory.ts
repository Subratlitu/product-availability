// src/vendors/vendor-http.factory.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';

@Injectable()
export class VendorHttpFactory {
    private axiosInstance: AxiosInstance;

    constructor(private config: ConfigService) {
        const timeout = Number(this.config.get('VENDOR_REQUEST_TIMEOUT_MS') ?? 2000);
        const retries = Number(this.config.get('VENDOR_RETRIES') ?? 2);

        this.axiosInstance = axios.create({
            timeout, // milliseconds
            
        });

        // Configure axios-retry:
        axiosRetry(this.axiosInstance, {
            retries, // number of retries
            retryDelay: (retryCount) => {
                // exponential backoff: 100 * 2^(retryCount-1)
                return 100 * Math.pow(2, retryCount - 1);
            },
            retryCondition: (error) => {
                const networkOrIdempotent = axiosRetry.isNetworkOrIdempotentRequestError(error);
                const serverError =
                    error.response && error.response.status >= 500 && error.response.status < 600;

                return Boolean(networkOrIdempotent || serverError);
            },

            onRetry: (retryCount, error, requestConfig) => {
                // Optional: log retry attempt (avoid importing logger here to keep it simple)
                // console.log(`[axios-retry] attempt #${retryCount} for ${requestConfig?.url}: ${error?.message}`);
            },
        });
    }

    getInstance(): AxiosInstance {
        return this.axiosInstance;
    }
}
