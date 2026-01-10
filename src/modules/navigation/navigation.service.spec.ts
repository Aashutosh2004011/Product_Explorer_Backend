import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NavigationService } from './navigation.service';
import { Navigation } from '../../entities/navigation.entity';

describe('NavigationService', () => {
  let service: NavigationService;
  let repository: Repository<Navigation>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NavigationService,
        {
          provide: getRepositoryToken(Navigation),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<NavigationService>(NavigationService);
    repository = module.get<Repository<Navigation>>(getRepositoryToken(Navigation));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of navigation items', async () => {
      const mockNavigations = [
        { id: '1', title: 'Books', slug: 'books' },
        { id: '2', title: 'Categories', slug: 'categories' },
      ];

      mockRepository.find.mockResolvedValue(mockNavigations);

      const result = await service.findAll();

      expect(result).toEqual(mockNavigations);
      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { title: 'ASC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a navigation item by ID', async () => {
      const mockNavigation = { id: '1', title: 'Books', slug: 'books' };

      mockRepository.findOne.mockResolvedValue(mockNavigation);

      const result = await service.findOne('1');

      expect(result).toEqual(mockNavigation);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['categories'],
      });
    });
  });

  describe('findBySlug', () => {
    it('should return a navigation item by slug', async () => {
      const mockNavigation = { id: '1', title: 'Books', slug: 'books' };

      mockRepository.findOne.mockResolvedValue(mockNavigation);

      const result = await service.findBySlug('books');

      expect(result).toEqual(mockNavigation);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { slug: 'books' },
        relations: ['categories'],
      });
    });
  });
});
