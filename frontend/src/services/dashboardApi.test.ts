import { afterEach, describe, expect, it, vi } from 'vitest'
import type { AxiosResponse } from 'axios'
import { api } from './api'
import { createOrder, listKitchenOrders, listWaiterOrders, recordSimulatedPayment, serveOrder, updateKitchenOrder } from './orderApi'
import { getManagerDashboard, getManagerRevenue } from './managerApi'

afterEach(() => vi.restoreAllMocks())

describe('role dashboard API services', () => {
  it('submits customer order item ids and quantities without client prices or totals', async () => {
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: { id: 'order-id' } } as AxiosResponse)
    await createOrder({ customerName: 'Sabarish', items: [{ menuItemId: 'menu-id', quantity: 2 }] })

    expect(post).toHaveBeenCalledWith('/api/orders', {
      customerName: 'Sabarish',
      items: [{ menuItemId: 'menu-id', quantity: 2 }],
    })
  })

  it('uses only the kitchen and waiter workflow endpoints', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: [] } as AxiosResponse)
    const patch = vi.spyOn(api, 'patch').mockResolvedValue({ data: { id: 'order-id' } } as AxiosResponse)

    await listKitchenOrders()
    await listKitchenOrders('PREPARING')
    await updateKitchenOrder('order-id', 'READY')
    await listWaiterOrders('READY')
    await serveOrder('order-id')

    expect(get).toHaveBeenNthCalledWith(1, '/api/kitchen/orders', { params: {} })
    expect(get).toHaveBeenNthCalledWith(2, '/api/kitchen/orders', { params: { status: 'PREPARING' } })
    expect(get).toHaveBeenNthCalledWith(3, '/api/waiter/orders', { params: { status: 'READY' } })
    expect(patch).toHaveBeenNthCalledWith(1, '/api/kitchen/orders/order-id/status', { status: 'READY' })
    expect(patch).toHaveBeenNthCalledWith(2, '/api/waiter/orders/order-id/serve')
  })

  it('records only simulated payment methods and passes report date ranges', async () => {
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: { id: 'payment-id' } } as AxiosResponse)
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: {} } as AxiosResponse)

    await recordSimulatedPayment('order-id', 'CASH')
    await getManagerDashboard('2026-09-01', '2026-09-27')
    await getManagerRevenue('2026-09-01', '2026-09-27')

    expect(post).toHaveBeenCalledWith('/api/cashier/orders/order-id/payments', { method: 'CASH' })
    expect(get).toHaveBeenNthCalledWith(1, '/api/manager/dashboard', { params: { from: '2026-09-01', to: '2026-09-27' } })
    expect(get).toHaveBeenNthCalledWith(2, '/api/manager/revenue', { params: { from: '2026-09-01', to: '2026-09-27' } })
  })
})