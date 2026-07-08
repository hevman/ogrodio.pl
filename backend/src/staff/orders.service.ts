import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from './audit.service';
import { VendureAdminService } from './vendure-admin.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly audit: AuditService,
    private readonly vendure: VendureAdminService,
  ) {}

  async listOrders(params: {
    page?: number;
    perPage?: number;
    filter?: string;
    state?: string;
  }) {
    const take = params.perPage ?? 20;
    const skip = ((params.page ?? 1) - 1) * take;

    const query = `
      query ListOrders($take: Int, $skip: Int, $filter: OrderFilterParameter) {
        orders(options: { take: $take, skip: $skip, filter: $filter, sort: { createdAt: DESC } }) {
          totalItems
          items {
            id code state
            createdAt updatedAt
            total totalWithTax
            customer { id emailAddress firstName lastName phoneNumber }
            shippingLines { shippingMethod { name } }
            lines { id quantity productVariant { name sku product { name } } unitPriceWithTax }
          }
        }
      }
    `;

    const filterObj = params.state ? { state: { eq: params.state } } : undefined;
    const data = await this.vendure.query(query, { take, skip, filter: filterObj }) as any;
    return data?.orders ?? { totalItems: 0, items: [] };
  }

  async getOrder(id: string) {
    const query = `
      query GetOrder($id: ID!) {
        order(id: $id) {
          id code state
          createdAt updatedAt
          total totalWithTax
          customer { id emailAddress firstName lastName phoneNumber }
          shippingAddress { fullName streetLine1 city postalCode country }
          billingAddress { fullName streetLine1 city postalCode country }
          shippingLines { shippingMethod { name } priceWithTax }
          lines {
            id quantity
            unitPriceWithTax linePriceWithTax
            productVariant { id name sku product { id name slug } }
            featuredAsset { preview }
          }
          payments { id method state amount }
          history { items { type data createdAt isPublic administrator { firstName lastName } } }
        }
      }
    `;
    const data = await this.vendure.query(query, { id }) as any;
    if (!data?.order) throw new NotFoundException(`Zamówienie ${id} nie znalezione`);
    return data.order;
  }

  async addOrderNote(orderId: string, note: string, staffId: number, staffName: string) {
    const mutation = `
      mutation AddNoteToOrder($input: AddNoteToOrderInput!) {
        addNoteToOrder(input: $input) { id }
      }
    `;
    await this.vendure.query(mutation, {
      input: { id: orderId, note: `[${staffName}]: ${note}`, isPublic: false },
    });
    await this.audit.log({
      staffId,
      action: 'order.note_added',
      entity: 'order',
      entityId: orderId,
      note,
    });
    return { ok: true };
  }

  async updateOrderState(orderId: string, state: string, staffId: number, staffName: string) {
    const mutation = `
      mutation TransitionOrderToState($id: ID!, $state: String!) {
        transitionOrderToState(id: $id, state: $state) {
          ... on Order { id state }
          ... on OrderStateTransitionError { errorCode message fromState toState }
        }
      }
    `;
    const data = await this.vendure.query(mutation, { id: orderId, state }) as any;
    const result = data?.transitionOrderToState;
    if (result?.errorCode) {
      throw new Error(`Błąd zmiany statusu: ${result.message}`);
    }
    await this.audit.log({
      staffId,
      action: 'order.status_changed',
      entity: 'order',
      entityId: orderId,
      after: { state },
      note: `Zmieniono status na ${state} przez ${staffName}`,
    });
    return { ok: true, state: result?.state };
  }
}
