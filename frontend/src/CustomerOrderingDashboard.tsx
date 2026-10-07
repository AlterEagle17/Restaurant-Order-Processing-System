import { useEffect, useState } from 'react'
import { Check, Clock3, Minus, Plus, Search, ShoppingBag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './contexts/useAuth'
import { createOrder, listMyOrders } from './services/orderApi'
import { listMenuCategories, listMenuItems } from './services/menuApi'
import type { ApiOrderStatus, MenuCategoryDto, MenuItemDto, OrderDto } from './types/api'
import './CustomerOrdering.css'

type CustomerMenuItem = {
  id: string
  name: string
  categoryName: string
  description: string
  price: number
  imageUrl: string | null
}

export type CustomerDemoOrder = {
  id: string
  table: number
  guest: string
  status: 'RECEIVED'
  items: { name: string; qty: number; lineTotal?: number }[]
  total: number
  time: string
}

const neutralMenuPlaceholder = 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=85'

const demoMenu: CustomerMenuItem[] = [
  { id: 'demo-idli', name: 'Idli', categoryName: 'Tiffin', description: 'Soft steamed rice cakes with sambar and chutney', price: 40, imageUrl: 'https://images.unsplash.com/photo-1604908556858-0b62d7f5a6b8?auto=format&fit=crop&w=900&q=85' },
  { id: 'demo-vada', name: 'Vada', categoryName: 'Tiffin', description: 'Crisp medu vada served with chutneys', price: 45, imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85' },
  { id: 'demo-masala-dosa', name: 'Masala Dosa', categoryName: 'Tiffin', description: 'Golden dosa with potato masala, sambar and chutney', price: 90, imageUrl: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=900&q=85' },
  { id: 'demo-samosa', name: 'Samosa', categoryName: 'Snacks', description: 'Crisp pastry filled with spiced potatoes', price: 30, imageUrl: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=900&q=85' },
  { id: 'demo-paneer-roll', name: 'Paneer Roll', categoryName: 'Snacks', description: 'Spiced paneer wrapped with onions and chutney', price: 90, imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=85' },
  { id: 'demo-meals', name: 'South Indian Meals', categoryName: 'Meals', description: 'Rice, sambar, rasam, poriyal, curd and pickle', price: 140, imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85' },
  { id: 'demo-biryani', name: 'Chicken Biryani', categoryName: 'Biryani', description: 'Aromatic basmati rice with masala chicken', price: 180, imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=85' },
  { id: 'demo-chicken-65', name: 'Chicken 65', categoryName: 'Chicken', description: 'Crisp, spicy chicken bites with curry leaves', price: 150, imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=85' },
  { id: 'demo-filter-coffee', name: 'Filter Coffee', categoryName: 'Drinks', description: 'Fresh decoction with hot milk', price: 35, imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=85' },
  { id: 'demo-gulab-jamun', name: 'Gulab Jamun', categoryName: 'Desserts', description: 'Warm milk-solid dumplings in cardamom syrup', price: 50, imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85' },
]

const formatINR = (amount: number) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(amount)

const statusSteps: ApiOrderStatus[] = ['RECEIVED', 'PREPARING', 'READY', 'SERVED']

export function CustomerOrderingDashboard({
  apiMode,
  onDemoOrder,
  notify,
}: {
  apiMode: boolean
  onDemoOrder: (order: CustomerDemoOrder) => void
  notify: (message: string) => void
}) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const tableNumber = user?.tableAccount ? user.tableNumber : undefined
  const nameKey = `spice-bite-guest-${user?.username ?? 'table'}`
  const [guestName, setGuestName] = useState(() => sessionStorage.getItem(nameKey) ?? '')
  const [nameDraft, setNameDraft] = useState(guestName)
  const [categories, setCategories] = useState<MenuCategoryDto[]>([])
  const [items, setItems] = useState<CustomerMenuItem[]>([])
  const [itemCache, setItemCache] = useState<Record<string, CustomerMenuItem>>(
    () => Object.fromEntries(demoMenu.map((item) => [item.id, item])),
  )
  const [category, setCategory] = useState('All items')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<Record<string, number>>({})
  const [orders, setOrders] = useState<OrderDto[]>([])
  const [demoOrders, setDemoOrders] = useState<CustomerDemoOrder[]>([])
  const [lastOrder, setLastOrder] = useState<OrderDto | null>(null)
  const [lastDemoOrder, setLastDemoOrder] = useState<CustomerDemoOrder | null>(null)
  const [historyVisible, setHistoryVisible] = useState(false)
  const [menuLoading, setMenuLoading] = useState(apiMode)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [error, setError] = useState('')

  const categoryId = categories.find((entry) => entry.name === category)?.id
  const cartCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0)
  const cartItems = Object.entries(cart).flatMap(([id, quantity]) => {
    const item = itemCache[id]
    return item && quantity > 0 ? [{ item, quantity }] : []
  })
  const total = cartItems.reduce((sum, entry) => sum + entry.item.price * entry.quantity, 0)
  const visibleItems = apiMode ? items : demoMenu.filter((item) => (category === 'All items' || item.categoryName === category)
    && `${item.name} ${item.description}`.toLowerCase().includes(search.toLowerCase()))

  useEffect(() => {
    if (!apiMode) return

    let active = true
    const timer = window.setTimeout(() => {
      void listMenuItems({ categoryId, query: search || undefined, page: 0, size: 100 }).then((result) => {
        if (!active) return
        const mapped = result.content.map((item: MenuItemDto) => ({
          id: item.id,
          name: item.name,
          categoryName: item.categoryName,
          description: item.description ?? '',
          price: item.price,
          imageUrl: item.imageUrl,
        }))
        setItems(mapped)
        setItemCache((current) => ({ ...current, ...Object.fromEntries(mapped.map((item) => [item.id, item])) }))
        setMenuLoading(false)
        setError('')
      }).catch((requestError: unknown) => {
        if (!active) return
        setError(requestError instanceof Error ? requestError.message : 'Could not load the menu.')
        setMenuLoading(false)
      })
    }, 120)
    return () => { active = false; window.clearTimeout(timer) }
  }, [apiMode, categoryId, category, search])

  useEffect(() => {
    if (!apiMode) return
    let active = true
    void listMenuCategories().then((result) => {
      if (active) setCategories(result)
    }).catch((requestError: unknown) => {
      if (active) setError(requestError instanceof Error ? requestError.message : 'Could not load menu categories.')
    })
    return () => { active = false }
  }, [apiMode])

  useEffect(() => {
    if (!apiMode || !historyVisible) return
    let active = true
    const refresh = () => {
      void listMyOrders().then((result) => {
        if (!active) return
        setOrders(result.content)
        setLastOrder((current) => current ? result.content.find((order) => order.id === current.id) ?? current : null)
      }).catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Could not load your orders.')
      })
    }
    refresh()
    const timer = window.setInterval(refresh, 12000)
    return () => { active = false; window.clearInterval(timer) }
  }, [apiMode, historyVisible])

  function adjust(id: string, amount: number) {
    setCart((current) => ({ ...current, [id]: Math.max(0, (current[id] ?? 0) + amount) }))
  }

  function startVisit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = nameDraft.trim()
    if (!name || !tableNumber) return
    sessionStorage.setItem(nameKey, name)
    setGuestName(name)
    setError('')
  }

  function startNewGuest() {
    sessionStorage.removeItem(nameKey)
    setGuestName('')
    setNameDraft('')
    setLastOrder(null)
    setLastDemoOrder(null)
    setHistoryVisible(false)
    setCart({})
  }

  function handleLogout() {
    sessionStorage.removeItem(nameKey)
    logout()
    navigate('/login', { replace: true })
  }

  async function placeOrder() {
    if (!tableNumber || !guestName) {
      setError('This device is not linked to an active table account.')
      return
    }
    if (cartCount === 0) {
      notify('Add an item to your order first.')
      return
    }
    setPlacingOrder(true)
    setError('')
    try {
      if (apiMode) {
        const created = await createOrder({
          customerName: guestName,
          items: Object.entries(cart).filter(([, quantity]) => quantity > 0)
            .map(([menuItemId, quantity]) => ({ menuItemId, quantity })),
        })
        setLastOrder(created)
        setOrders((current) => [created, ...current.filter((order) => order.id !== created.id)])
      } else {
        const demoOrder: CustomerDemoOrder = {
          id: `ORD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
          table: tableNumber,
          guest: guestName,
          status: 'RECEIVED',
          items: cartItems.map(({ item, quantity }) => ({ name: item.name, qty: quantity, lineTotal: item.price * quantity })),
          total,
          time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        }
        setDemoOrders((current) => [demoOrder, ...current])
        setLastDemoOrder(demoOrder)
        onDemoOrder(demoOrder)
        notify(`${demoOrder.id} sent to the kitchen.`)
      }
      setCart({})
      setHistoryVisible(true)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not place the order. Your cart is unchanged.')
    } finally {
      setPlacingOrder(false)
    }
  }

  if (!guestName) {
    return <main className="customer-welcome-page">
      <section className="customer-welcome">
        <span className="brand-wordmark">SPICE <b>BITE</b></span>
        <p className="customer-kicker">FRESH. FAST. SOUTH INDIAN.</p>
        {tableNumber ? <>
          <span className="table-label">TABLE {String(tableNumber).padStart(2, '0')}</span>
          <h1>Welcome!</h1>
          <p className="welcome-copy">Enter your name to start your order.</p>
          <form className="guest-name-form" onSubmit={startVisit}>
            <label htmlFor="guest-name">Your name</label>
            <input id="guest-name" autoComplete="name" maxLength={120} required value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} placeholder="Enter your name" />
            <button className="customer-primary" type="submit">START ORDER <Plus size={18} /></button>
          </form>
        </> : <div role="alert" className="table-account-error">This device is not assigned to a table. Contact the restaurant team.</div>}
      </section>
    </main>
  }

  const categoryNames = ['All items', ...new Set((apiMode ? categories.map((entry) => entry.name) : demoMenu.map((entry) => entry.categoryName)))]
  const currentOrders = apiMode ? orders : []

  return <section className="customer-experience">
    <header className="customer-header">
      <div><span className="brand-wordmark compact-wordmark">SPICE <b>BITE</b></span><span className="customer-tagline">FRESH. FAST. SOUTH INDIAN.</span></div>
      <div className="customer-welcome-meta"><span className="table-label">TABLE {String(tableNumber ?? 0).padStart(2, '0')}</span><strong>Welcome, {guestName}</strong><div className="customer-header-actions"><button className="new-guest-button" onClick={startNewGuest}>NEW GUEST</button><button className="new-guest-button logout" onClick={handleLogout}>LOG OUT</button></div></div>
    </header>

    {lastOrder && <section className="order-confirmation" aria-live="polite">
      <div className="confirmation-title"><span className="confirmation-check"><Check size={20} /></span><div><p>ORDER PLACED</p><h2>{lastOrder.orderNumber}</h2></div><span className="order-status-name">{lastOrder.status.replace('_', ' ')}</span></div>
      <p>Thanks, {lastOrder.customerName}. Your order is with our kitchen.</p>
      <div className="order-progress">{statusSteps.map((step) => <div key={step} className={statusSteps.indexOf(step) <= statusSteps.indexOf(lastOrder.status as ApiOrderStatus) ? 'progress-step reached' : 'progress-step'}><i />{step === 'RECEIVED' ? 'Received' : step === 'PREPARING' ? 'Preparing' : step === 'READY' ? 'Ready' : 'Served'}</div>)}</div>
    </section>}
    {lastDemoOrder && <section className="order-confirmation" aria-live="polite"><div className="confirmation-title"><span className="confirmation-check"><Check size={20} /></span><div><p>ORDER PLACED</p><h2>{lastDemoOrder.id}</h2></div><span className="order-status-name">RECEIVED</span></div><p>Thanks, {lastDemoOrder.guest}. Your order is with our kitchen.</p><div className="order-progress">{statusSteps.map((step, index) => <div key={step} className={index === 0 ? 'progress-step reached' : 'progress-step'}><i />{step === 'RECEIVED' ? 'Received' : step === 'PREPARING' ? 'Preparing' : step === 'READY' ? 'Ready' : 'Served'}</div>)}</div></section>}

    <div className="customer-toolbar"><div><p className="customer-kicker">MADE FRESH, SERVED FAST</p><h1>{historyVisible ? 'Your orders' : 'What are you craving?'}</h1></div><button className="customer-history-toggle" onClick={() => setHistoryVisible((value) => !value)}><ShoppingBag size={19} />{historyVisible ? 'MENU' : `ORDERS${currentOrders.length ? ` (${currentOrders.length})` : ''}`}</button></div>

    {error && <p role="alert" className="form-error">{error}</p>}
    {historyVisible ? <section className="customer-history-list">
      {apiMode && currentOrders.length === 0 && <p className="customer-empty">Your orders will appear here once they are placed.</p>}
      {apiMode ? currentOrders.map((order) => <article className="customer-order-row" key={order.id}><div><strong>{order.orderNumber}</strong><span>{order.items.reduce((sum, item) => sum + item.quantity, 0)} items · {new Date(order.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span></div><span className={`customer-order-status status-${order.status.toLowerCase()}`}>{order.status}</span><strong>{formatINR(order.total)}</strong></article>) : demoOrders.map((order) => <article className="customer-order-row" key={order.id}><div><strong>{order.id}</strong><span>{order.items.reduce((sum, item) => sum + item.qty, 0)} items · {order.time}</span></div><span className="customer-order-status status-received">RECEIVED</span><strong>{formatINR(order.total)}</strong></article>)}
      {!apiMode && demoOrders.length === 0 && <p className="customer-empty">Your orders will appear here once they are placed.</p>}
    </section> : <div className="customer-order-layout">
      <main className="customer-menu-area">
        <div className="customer-menu-tools"><label className="customer-search"><Search size={19} /><input aria-label="Search menu" placeholder="Search food" value={search} onChange={(event) => { setSearch(event.target.value); setMenuLoading(apiMode) }} /></label><nav className="customer-categories" aria-label="Menu categories">{categoryNames.map((name) => <button key={name} className={category === name ? 'active' : ''} onClick={() => { setCategory(name); setMenuLoading(apiMode) }}>{name}</button>)}</nav></div>
        {menuLoading ? <p className="customer-empty">Loading menu...</p> : <div className="customer-food-grid">{visibleItems.map((item) => <article className="customer-food-card" key={item.id}>
          <img src={item.imageUrl?.trim() || neutralMenuPlaceholder} alt={item.name} loading="lazy" />
          <div className="food-card-body"><span className="food-category">{item.categoryName}</span><h2>{item.name}</h2><p>{item.description}</p><div className="food-card-footer"><strong>{formatINR(item.price)}</strong>{cart[item.id] ? <div className="customer-quantity"><button aria-label={`Remove one ${item.name}`} onClick={() => adjust(item.id, -1)}><Minus size={18} /></button><span>{cart[item.id]}</span><button aria-label={`Add one ${item.name}`} onClick={() => adjust(item.id, 1)}><Plus size={18} /></button></div> : <button className="food-add-button" onClick={() => adjust(item.id, 1)}>ADD <Plus size={17} /></button>}</div></div>
        </article>)}</div>}
      </main>

      <aside className="customer-cart">
        <div className="customer-cart-head"><div><span className="cart-count-large">{cartCount}</span><div><p className="customer-kicker">TABLE {String(tableNumber ?? 0).padStart(2, '0')}</p><h2>Your order</h2></div></div><ShoppingBag size={21} /></div>
        <p className="cart-customer-name">For <strong>{guestName}</strong></p>
        <div className="customer-cart-lines">{cartItems.length ? cartItems.map(({ item, quantity }) => <div className="customer-cart-line" key={item.id}><div><strong>{item.name}</strong><span>{formatINR(item.price)} each</span></div><div><span>{quantity} ×</span><strong>{formatINR(item.price * quantity)}</strong></div></div>) : <p className="customer-empty">Add a favourite to get started.</p>}</div>
        <div className="customer-cart-total"><span>Subtotal</span><strong>{formatINR(total)}</strong></div>
        <button className="customer-primary place-order-button" disabled={cartCount === 0 || placingOrder} onClick={() => void placeOrder()}>{placingOrder ? 'PLACING ORDER...' : 'PLACE ORDER'} <span>{formatINR(total)}</span></button>
        <p className="cart-service-note"><Clock3 size={15} /> Prepared fresh after you order</p>
      </aside>
    </div>}
  </section>
}