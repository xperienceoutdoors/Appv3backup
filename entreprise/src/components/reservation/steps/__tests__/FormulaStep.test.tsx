/** @jest-environment jsdom */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FormulaStep from '../FormulaStep';
import { formulaService } from '../../../../services/formulaService';
import { realTimeAvailabilityService } from '../../../../services/realTimeAvailabilityService';

// Mock des services
jest.mock('../../../../services/formulaService');
jest.mock('../../../../services/realTimeAvailabilityService');

describe('FormulaStep', () => {
  const mockProps = {
    data: {
      activity: {
        id: 'activity1',
        pricing: { basePrice: 100 },
        maxParticipants: 10
      },
      date: '2025-02-04'
    },
    onUpdate: jest.fn(),
    onNext: jest.fn(),
    onPrevious: jest.fn()
  };

  const mockFormulas = [
    {
      id: 'formula1',
      activityId: 'activity1',
      name: 'Test Formula 1',
      duration: 60,
      isActive: true,
      rates: [{ price: 100 }],
      timeSlots: [{ time: '10:00' }, { time: '14:00' }]
    }
  ];

  const mockAvailability = {
    date: '2025-02-04',
    isOpen: true,
    timeSlots: [
      {
        startTime: '10:00',
        endTime: '11:00',
        formula: mockFormulas[0],
        capacity: 5,
        remainingSpots: 5,
        price: 100
      },
      {
        startTime: '14:00',
        endTime: '15:00',
        formula: mockFormulas[0],
        capacity: 5,
        remainingSpots: 5,
        price: 100
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (formulaService.getAll as jest.Mock).mockResolvedValue(mockFormulas);
    (realTimeAvailabilityService.getAvailability as jest.Mock).mockResolvedValue([
      mockAvailability
    ]);
  });

  it('devrait charger et afficher les formules', async () => {
    // Arrange & Act
    render(<FormulaStep {...mockProps} />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Test Formula 1')).toBeInTheDocument();
    });
  });

  it('devrait permettre de sélectionner une formule', async () => {
    // Arrange
    render(<FormulaStep {...mockProps} />);

    // Act
    await waitFor(() => {
      const formulaElement = screen.getByText('Test Formula 1').closest('div');
      if (formulaElement) {
        fireEvent.click(formulaElement);
      }
    });

    // Assert
    await waitFor(() => {
      expect(realTimeAvailabilityService.getAvailability).toHaveBeenCalled();
    });
  });

  it('devrait permettre de changer la quantité', async () => {
    // Arrange
    render(<FormulaStep {...mockProps} />);

    // Act
    await waitFor(() => {
      const plusButton = screen.getByText('+');
      fireEvent.click(plusButton);
    });

    // Assert
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('devrait afficher les créneaux disponibles', async () => {
    // Arrange
    render(<FormulaStep {...mockProps} />);

    // Act & Assert
    await waitFor(() => {
      expect(screen.getByText('10:00')).toBeInTheDocument();
      expect(screen.getByText('14:00')).toBeInTheDocument();
    });
  });

  it('devrait permettre de sélectionner un créneau', async () => {
    // Arrange
    render(<FormulaStep {...mockProps} />);

    // Act
    await waitFor(() => {
      const timeSlot = screen.getByText('10:00');
      fireEvent.click(timeSlot);
    });

    // Assert
    expect(mockProps.onUpdate).not.toHaveBeenCalled();
    
    const continueButton = screen.getByText('Continuer');
    fireEvent.click(continueButton);

    expect(mockProps.onUpdate).toHaveBeenCalledWith(expect.objectContaining({
      formula: expect.objectContaining({
        id: 'formula1',
        quantity: 1
      }),
      timeSlot: '10:00'
    }));
    expect(mockProps.onNext).toHaveBeenCalled();
  });

  it('devrait désactiver le bouton continuer si aucun créneau n\'est sélectionné', async () => {
    // Arrange
    render(<FormulaStep {...mockProps} />);

    // Assert
    await waitFor(() => {
      const continueButton = screen.getByText('Continuer');
      expect(continueButton).toBeDisabled();
    });
  });

  it('devrait afficher un message d\'erreur si aucun créneau n\'est disponible', async () => {
    // Arrange
    (realTimeAvailabilityService.getAvailability as jest.Mock).mockResolvedValue([
      { ...mockAvailability, timeSlots: [] }
    ]);

    // Act
    render(<FormulaStep {...mockProps} />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Aucun créneau disponible pour 1 ressource(s)')).toBeInTheDocument();
    });
  });
});
