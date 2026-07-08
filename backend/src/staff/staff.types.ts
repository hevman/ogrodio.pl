export type ServiceTicketStatus =
  | 'NEW'
  | 'IN_PROGRESS'
  | 'WAITING_CUSTOMER'
  | 'DONE'
  | 'CLOSED';

export interface CreateTicketDto {
  customerId?: number;
  orderId?: string;         // Vendure order code
  productId?: string;       // Vendure product ID
  description: string;
  images?: string[];        // URL-e do zdjęć
}

export interface UpdateTicketDto {
  status?: ServiceTicketStatus;
  assignedWorkerId?: number;
  notes?: string;
}
