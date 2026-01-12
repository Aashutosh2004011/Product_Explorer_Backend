import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getWelcomeMessage() {
    return {
      message: 'Hello Aashutosh here! 👋',
      version: '1.0.0',
      status: 'running',
      docs: '/api',
      endpoints: {
        navigation: '/navigation',
        categories: '/categories',
        products: '/products',
        scraping: '/scraping',
        viewHistory: '/view-history',
      },
      github: {
        backend: 'https://github.com/Aashutosh2004011/Product_Explorer_Backend',
        frontend: 'https://github.com/Aashutosh2004011/Product_Explorer_Frontend',
      },
      live: {
        frontend: 'https://product-explorer-frontend-iota.vercel.app',
        api: 'https://product-explorer-backend-qlnt.onrender.com',
      }
    };
  }
}
