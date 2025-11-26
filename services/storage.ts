import { Registration, RegistrationStatus } from '../types';

const STORAGE_KEY = 'serene_registrations_v1';

export const getRegistrations = (): Registration[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveRegistration = (registration: Registration): void => {
  const current = getRegistrations();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, registration]));
};

export const updateRegistrationStatus = (id: string, status: RegistrationStatus, welcomeMessage?: string): void => {
  const current = getRegistrations();
  const updated = current.map(r => {
    if (r.id === id) {
      return { ...r, status, welcomeMessage: welcomeMessage || r.welcomeMessage };
    }
    return r;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const getRegistrationByCode = (code: string): Registration | undefined => {
  const current = getRegistrations();
  return current.find(r => r.ticketCode === code);
};

// Seed some data if empty
export const seedData = () => {
  if (getRegistrations().length === 0) {
    const dummy: Registration[] = [
      {
        id: '1',
        fullName: 'Elena Vance',
        email: 'elena@example.com',
        phone: '555-0101',
        status: RegistrationStatus.PENDING,
        registrationDate: new Date().toISOString(),
        ticketCode: 'EV-12345'
      },
      {
        id: '2',
        fullName: 'Liam Kossen',
        email: 'liam@example.com',
        phone: '555-0102',
        status: RegistrationStatus.APPROVED,
        registrationDate: new Date(Date.now() - 86400000).toISOString(),
        ticketCode: 'LK-67890',
        welcomeMessage: 'Welcome Liam, we await your presence.'
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dummy));
  }
};