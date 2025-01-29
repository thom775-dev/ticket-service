import { Test, TestingModule } from '@nestjs/testing'
import { EventsService } from './events.service'
import { PrismaService } from '../prisma/prisma.service'
import { NotFoundException } from '@nestjs/common'
import { UpdateEventDto } from './dto'

describe('EventsService', () => {
  let service: EventsService
  let mockPrisma: any

  beforeEach(async () => {
    mockPrisma = {
      event: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile()

    service = module.get<EventsService>(EventsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getAllEvents', () => {
    it('should return a list of events', async () => {
      const mockEvents = [
        { id: 1, name: 'Event 1' },
        { id: 2, name: 'Event 2' },
      ]
      mockPrisma.event.findMany.mockResolvedValue(mockEvents)

      const result = await service.getAllEvents()
      expect(result).toEqual(mockEvents)
      expect(mockPrisma.event.findMany).toHaveBeenCalled()
    })
  })

  describe('searchEvent', () => {
    it('should return events matching the search key', async () => {
      const mockEvents = [{ id: 1, name: 'Concert' }]
      mockPrisma.event.findMany.mockResolvedValue(mockEvents)

      const result = await service.searchEvent('Concert')
      expect(result).toEqual(mockEvents)
      expect(mockPrisma.event.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'Concert', mode: 'insensitive' } },
            { venue: { contains: 'Concert', mode: 'insensitive' } },
          ],
        },
        include: expect.any(Object),
      })
    })
  })

  describe('getEvents', () => {
    it('should return events for a given user', async () => {
      const mockEvents = [{ id: 1, userId: 1, name: 'User Event' }]
      mockPrisma.event.findMany.mockResolvedValue(mockEvents)

      const result = await service.getEvents(1)
      expect(result).toEqual(mockEvents)
      expect(mockPrisma.event.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: expect.any(Object),
      })
    })
  })

  describe('getEventById', () => {
    it('should return a specific event by userId and eventId', async () => {
      const mockEvent = { id: 1, userId: 1, name: 'Test Event' }
      mockPrisma.event.findUnique.mockResolvedValue(mockEvent)

      const result = await service.getEventById(1, 1)
      expect(result).toEqual(mockEvent)
      expect(mockPrisma.event.findUnique).toHaveBeenCalledWith({
        where: { userId: 1, id: 1 },
        include: expect.any(Object),
      })
    })

    it('should return null if event is not found', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(null)
      const result = await service.getEventById(1, 99)
      expect(result).toBeNull()
    })
  })

  describe('createEvent', () => {
    it('should create and return a new event', async () => {
      const mockCreateDto = {
        name: 'New Event',
        description: 'Description',
        dateTime: '2025-02-01T10:00:00Z',
        venue: 'Test Venue',
        availableTickets: 100,
      }

      const mockEvent = { id: 1, userId: 1, ...mockCreateDto }
      mockPrisma.event.create.mockResolvedValue(mockEvent)

      const result = await service.createEvent(1, mockCreateDto)
      expect(result).toEqual(mockEvent)
      expect(mockPrisma.event.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          name: 'New Event',
          description: 'Description',
          dateTime: new Date(mockCreateDto.dateTime),
          venue: 'Test Venue',
          availableTickets: 100,
        },
      })
    })

    it('should throw an error if event creation fails', async () => {
      mockPrisma.event.create.mockRejectedValue(
        new Error('Error while creating event'),
      )
      await expect(service.createEvent(1, {} as any)).rejects.toThrow(
        'Error while creating event',
      )
    })
  })

  describe('updateEventById', () => {
    it('should update and return the event', async () => {
      const mockEvent = {
        id: 1,
        name: 'Old Event',
        description: 'Old Description',
        dateTime: '2025-01-01T10:00:00Z',
        venue: 'Old Venue',
        availableTickets: 100,
      }

      const mockUpdateDto = {
        name: 'Updated Event',
        description: 'Updated Description',
        dateTime: '2025-02-01T10:00:00Z',
        venue: 'Updated Venue',
        availableTickets: 150,
      }

      mockPrisma.event.findUnique.mockResolvedValue(mockEvent)

      const updatedEvent = { ...mockEvent, ...mockUpdateDto }
      mockPrisma.event.update.mockResolvedValue(updatedEvent)

      const result = await service.updateEventById(1, 1, mockUpdateDto)

      expect(result).toEqual(updatedEvent)

      expect(mockPrisma.event.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: mockUpdateDto,
      })
    })

    it('should throw NotFoundException if event is not found', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(null)

      const emptyUpdateDto: UpdateEventDto = {} as UpdateEventDto

      await expect(
        service.updateEventById(1, 99, emptyUpdateDto),
      ).rejects.toThrow(new NotFoundException('Event does not exist'))
    })
  })

  describe('deleteEventById', () => {
    it('should delete an event and return it', async () => {
      const mockEvent = { id: 1, userId: 1, name: 'Event to delete' }

      mockPrisma.event.findUnique.mockResolvedValue(mockEvent)
      mockPrisma.event.delete.mockResolvedValue(mockEvent)

      const result = await service.deleteEventById(1, 1)
      expect(result).toEqual(mockEvent)
      expect(mockPrisma.event.delete).toHaveBeenCalledWith({ where: { id: 1 } })
    })

    it('should throw NotFoundException if event is not found', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(null)

      await expect(service.deleteEventById(1, 99)).rejects.toThrow(
        new NotFoundException('Event does not exist'),
      )
    })
  })
})
