import { useEffect, useState } from 'react'
import {
  ArrowRight, ArrowUpRight, Bell, Check, ChefHat, ChevronDown, CircleDollarSign, Clock3,
  Coffee, CreditCard, LayoutDashboard, LogOut, Menu as MenuIcon, Minus, Plus, Search,
  ShieldCheck, ShoppingBag, Utensils, Users, X,
} from 'lucide-react'
import { BrowserRouter, Link, Navigate, Outlet, Route, Routes, useNavigate, useOutletContext } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/useAuth'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { ROLE_HOME, USER_ROLES, type DemoAccount, type UserRole } from './types/auth'
import type { ManagerDashboardDto, MenuCategoryDto, MenuItemDto, OrderDto, PaymentDto, RevenuePointDto, UserSummary } from './types/api'
import { createOrder, listKitchenOrders, listMyOrders, listOrders, listPayments, listPendingCashierOrders, listWaiterOrders, recordSimulatedPayment, serveOrder, updateKitchenOrder } from './services/orderApi'
import { createMenuCategory, createMenuItem, listAdminMenuCategories, listAdminMenuItems, listMenuCategories, listMenuItems, setMenuItemActive, updateMenuCategory, updateMenuItem } from './services/menuApi'
import { createUser, listUsers, resetUserPassword, setUserActive, setUserRole, updateUser } from './services/adminApi'
import { getManagerDashboard, getManagerRevenue, listManagerOrders } from './services/managerApi'
import './App.css'

type OrderStatus = 'RECEIVED' | 'PREPARING' | 'READY' | 'SERVED' | 'PAID' | 'COMPLETED' | 'CANCELLED'
type Order = { id: string; backendId?: string; table: number; guest: string; status: OrderStatus; items: { name: string; qty: number; lineTotal?: number }[]; total: number; time: string }

function mapOrder(dto: OrderDto): Order {
  return {
    id: dto.orderNumber,
    backendId: dto.id,
    table: dto.tableNumber,
    guest: dto.customerName,
    status: dto.status,
    items: dto.items.map((item) => ({ name: item.name, qty: item.quantity, lineTotal: item.lineTotal })),
    total: dto.total,
    time: new Date(dto.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
  }
}
const initialOrders: Order[] = [
  { id: 'ORD-1048', table: 6, guest: 'Avery James', status: 'RECEIVED', items: [{ name: 'Truffle rigatoni', qty: 2 }, { name: 'Garden salad', qty: 1 }], total: 62, time: '12:42 PM' },
  { id: 'ORD-1047', table: 3, guest: 'Sam Rivera', status: 'PREPARING', items: [{ name: 'Roast chicken', qty: 1 }, { name: 'Rosemary potatoes', qty: 2 }], total: 54, time: '12:38 PM' },
  { id: 'ORD-1046', table: 8, guest: 'Charlie Kim', status: 'READY', items: [{ name: 'Seared salmon', qty: 2 }, { name: 'Citrus soda', qty: 2 }], total: 76, time: '12:31 PM' },
  { id: 'ORD-1045', table: 2, guest: 'Robin Flores', status: 'SERVED', items: [{ name: 'Wild mushroom toast', qty: 1 }, { name: 'Espresso', qty: 2 }], total: 32, time: '12:19 PM' },
  { id: 'ORD-1044', table: 5, guest: 'Drew Parker', status: 'RECEIVED', items: [{ name: 'Crispy calamari', qty: 1 }, { name: 'Truffle rigatoni', qty: 1 }], total: 47, time: '12:14 PM' },
  { id: 'ORD-1043', table: 1, guest: 'Casey Ward', status: 'PAID', items: [{ name: 'Roast chicken', qty: 1 }, { name: 'House lemonade', qty: 1 }], total: 38, time: '11:58 AM' },
]
const menuItems = [
  { id: 'm1', name: 'Truffle rigatoni', category: 'Mains', price: 24, description: 'Fresh pasta, wild mushroom, parmesan', image: 'photo-1473093295043-cdd812d0e601' },
  { id: 'm2', name: 'Roast chicken', category: 'Mains', price: 28, description: 'Herb jus, rosemary potatoes, greens', image: 'photo-1532550907401-a500c9a57435' },
  { id: 'm3', name: 'Seared salmon', category: 'Mains', price: 32, description: 'Lemon beurre blanc, crisp fennel', image: 'photo-1467003909585-2f8a72700288' },
  { id: 'm4', name: 'Wild mushroom toast', category: 'Starters', price: 16, description: 'Sourdough, whipped ricotta, thyme', image: 'photo-1509440159596-0249088772ff' },
  { id: 'm5', name: 'Garden salad', category: 'Starters', price: 14, description: 'Little gem, herbs, green goddess', image: 'photo-1512621776951-a57141f2eefd' },
  { id: 'm6', name: 'Citrus soda', category: 'Drinks', price: 8, description: 'Blood orange, rosemary, sparkling', image: 'photo-1544145945-f90425340c7e' },
]
const roleNames: Record<UserRole, string> = { ADMIN: 'Administrator', MANAGER: 'Manager', CASHIER: 'Cashier', WAITER: 'Floor team', KITCHEN_STAFF: 'Kitchen', CUSTOMER: 'Guest' }
const navigation: Record<UserRole, { label: string; icon: typeof LayoutDashboard }[]> = {
  ADMIN: [{ label: 'Overview', icon: LayoutDashboard }, { label: 'User management', icon: Users }, { label: 'Menu & categories', icon: Utensils }],
  MANAGER: [{ label: 'Overview', icon: LayoutDashboard }, { label: 'Orders', icon: ShoppingBag }],
  CASHIER: [{ label: 'Billing desk', icon: CreditCard }, { label: 'Payment history', icon: CircleDollarSign }],
  WAITER: [{ label: 'Service board', icon: Utensils }, { label: 'All orders', icon: ShoppingBag }],
  KITCHEN_STAFF: [{ label: 'Kitchen board', icon: ChefHat }],
  CUSTOMER: [{ label: 'Order menu', icon: MenuIcon }, { label: 'My orders', icon: ShoppingBag }],
}
type WorkspaceContext = { orders: Order[]; setOrders: (orders: Order[]) => void; notify: (message: string) => void; section: string; setSection: (section: string) => void }

function App() {
  const [orders, setOrders] = useState(initialOrders)
  const [toast, setToast] = useState('')
  const [section, setSection] = useState('overview')
  function notify(message: string) { setToast(message); window.setTimeout(() => setToast(''), 2600) }
  const workspace = { orders, setOrders, notify, section, setSection }
  return <AuthProvider><BrowserRouter><Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<LoginPage setSection={setSection} />} />
    {USER_ROLES.map((role) => <Route key={role} element={<ProtectedRoute role={role} />}><Route path={ROLE_HOME[role]} element={<WorkspaceLayout workspace={workspace} />}><Route index element={<RolePage role={role} />} /></Route></Route>)}
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>{toast && <div className="toast"><Check size={17} />{toast}</div>}</BrowserRouter></AuthProvider>
}

function LoginPage({ setSection }: { setSection: (section: string) => void }) {
  const { user, login, accounts, ready, mode } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const quickAccounts = mode === 'demo' ? accounts.filter((account) => account.active) : []
  if (user) return <Navigate to={ROLE_HOME[user.role]} replace />
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('')
    if (!username.trim() || !password) { setError('Enter both your username and password to continue.'); return }
    setLoading(true)
    await new Promise((resolve) => window.setTimeout(resolve, 400))
    try {
      const authenticated = await login(username, password)
      setSection('overview')
      navigate(ROLE_HOME[authenticated.role], { replace: true })
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  return <main className="login-page">
    <section className="login-visual" aria-label="Linden restaurant"><div className="visual-top"><span className="brand-mark"><Utensils size={17} /></span><span>LINDEN <i>HOUSE</i></span><span className="visual-location">PORTLAND · EST. 2018</span></div><div className="visual-copy"><p className="eyebrow light">A GOOD EVENING STARTS HERE</p><h1>Gather around<br />something <em>good.</em></h1><p>Thoughtful food. A table for everyone.</p></div><div className="visual-caption"><span>SEASONAL KITCHEN · NEIGHBORHOOD TABLE</span><span>45°31'12.0"N 122°40'55.0"W</span></div></section>
    <section className="login-panel"><div className="login-panel-inner"><div className="login-mobile-brand"><span className="brand-mark"><Utensils size={16} /></span>LINDEN <i>HOUSE</i></div><div className="login-heading"><p className="eyebrow">TEAM PORTAL</p><h2>Welcome back</h2><p>Sign in to manage today's service.</p></div>
      <form className="login-form" onSubmit={handleSubmit} noValidate><label htmlFor="username">Username</label><input id="username" autoComplete="username" placeholder="Your username" value={username} onChange={(event) => setUsername(event.target.value)} /><div className="password-label"><label htmlFor="password">Password</label><span>SECURE SIGN IN</span></div><div className="password-input"><input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'HIDE' : 'SHOW'}</button></div>{error && <p role="alert" className="form-error">{error}</p>}<button className="login-submit" type="submit" disabled={loading || !ready}>{loading ? <><span className="spinner" />Signing in...</> : <>Sign in <ArrowRight size={17} /></>}</button></form>
      {mode === 'demo' && quickAccounts.length > 0 && <div className="demo-panel"><div className="demo-panel-title"><span><ShieldCheck size={15} /> DEVELOPMENT ACCESS</span><span>NOT AVAILABLE IN PRODUCTION</span></div><div className="demo-list">{quickAccounts.map((account) => <button key={account.id} type="button" className="demo-account" onClick={() => { setUsername(account.username); setPassword(account.password); setError('') }}><span className="demo-avatar">{account.displayName.split(' ').map((part) => part[0]).join('')}</span><span className="demo-identity"><strong>{account.username}</strong><small>{roleNames[account.role]}</small></span><ArrowRight size={15} /></button>)}</div></div>}
      <p className="login-footer">Need access? Ask your restaurant administrator.</p></div></section>
  </main>
}

function WorkspaceLayout({ workspace }: { workspace: WorkspaceContext }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  if (!user) return null
  const sectionTitle = user.role === 'ADMIN' ? 'ADMINISTRATION' : user.role === 'CUSTOMER' ? 'DINING ROOM' : 'SERVICE OPERATIONS'
  return <div className="workspace"><aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
    <Link to={ROLE_HOME[user.role]} className="sidebar-brand"><span className="brand-mark"><Utensils size={16} /></span><span>LINDEN <i>HOUSE</i><small>RESTAURANT OPERATIONS</small></span><button type="button" className="sidebar-close" aria-label="Close navigation" onClick={(event) => { event.preventDefault(); setMobileOpen(false) }}><X size={18} /></button></Link>
    <div className="sidebar-location"><span className="online-dot" /> PORTLAND, OREGON <ChevronDown size={13} /></div><p className="nav-section-label">{sectionTitle}</p><nav className="side-nav">{navigation[user.role].map(({ label, icon: Icon }, index) => { const target = user.role === 'ADMIN' ? label === 'User management' ? 'users' : label === 'Menu & categories' ? 'menu' : 'overview' : user.role === 'CUSTOMER' ? label === 'My orders' ? 'orders' : 'menu' : user.role === 'CASHIER' && label === 'Payment history' ? 'payments' : user.role === 'MANAGER' && label === 'Orders' ? 'orders' : user.role === 'WAITER' && label === 'All orders' ? 'all-orders' : 'overview'; const active = workspace.section === target || (!workspace.section && index === 0); return <a key={label} href="#workspace-content" aria-current={active ? 'page' : undefined} onClick={(event) => { event.preventDefault(); workspace.setSection(target); setMobileOpen(false); if (target === 'orders' || target === 'payments' || target === 'all-orders') window.setTimeout(() => { const element = target === 'all-orders' ? document.querySelector('.waiter-orders') : document.querySelector('.recent-orders'); element?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, 0) }} className={active ? 'nav-item active' : 'nav-item'}><Icon size={17} /><span>{label}</span>{active && <span className="nav-indicator" />}</a> })}</nav>
    <div className="sidebar-bottom"><div className="sidebar-note"><span className="note-icon"><Clock3 size={15} /></span><span><strong>Lunch service</strong><small>Open · until 3:00 PM</small></span></div><div className="profile-block"><div className="profile-avatar">{user.displayName.split(' ').map((part) => part[0]).join('')}</div><div className="profile-info"><strong>{user.displayName}</strong><span>{roleNames[user.role]}</span></div><button className="icon-button logout-button" title="Sign out" aria-label="Sign out" onClick={() => { logout(); workspace.setSection('overview'); navigate('/login', { replace: true }) }}><LogOut size={16} /></button></div></div>
  </aside>{mobileOpen && <button aria-label="Close navigation" className="mobile-scrim" onClick={() => setMobileOpen(false)} />}<div className="workspace-main"><header className="topbar"><button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><MenuIcon size={20} /></button><div className="breadcrumbs"><span>Workspace</span><ArrowRight size={13} /><strong>{roleNames[user.role]}</strong></div><div className="topbar-actions"><span className="service-status"><span className="online-dot" /> SERVICE LIVE</span><button className="icon-button notification-button" aria-label="Notifications"><Bell size={18} /><i /></button><div className="topbar-user"><div className="profile-avatar small-avatar">{user.displayName.split(' ').map((part) => part[0]).join('')}</div><span>{user.displayName.split(' ')[0]}</span><ChevronDown size={14} /></div></div></header><main className="page-content" id="workspace-content"><Outlet context={workspace} /></main><footer className="workspace-footer"><span>LINDEN HOUSE <b>·</b> RESTAURANT OPERATIONS</span><span>LOCAL DEMO ENVIRONMENT <b>·</b> V1.0</span></footer></div></div>
}

function useWorkspace() { return useOutletContext<WorkspaceContext>() }
function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) { return <div className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="heading-description">{description}</p></div>{action}</div> }
function RolePage({ role }: { role: UserRole }) {
  const { mode } = useAuth()
  switch (role) {
    case 'ADMIN': return mode === 'api' ? <AdminApiDashboard /> : <AdminDashboard />
    case 'MANAGER': return mode === 'api' ? <ManagerApiDashboard /> : <ManagerDashboard />
    case 'CASHIER': return mode === 'api' ? <CashierApiDashboard /> : <CashierDashboard />
    case 'WAITER': return <WaiterDashboard />
    case 'KITCHEN_STAFF': return <KitchenDashboard />
    case 'CUSTOMER': return mode === 'api' ? <CustomerApiDashboard /> : <CustomerDashboard />
  }
}
function MetricCard({ label, value, change, detail, icon: Icon, accent = '' }: { label: string; value: string; change?: string; detail: string; icon: typeof Users; accent?: string }) { return <article className="metric-card"><div className="metric-top"><span>{label}</span><span className={`metric-icon ${accent}`}><Icon size={17} /></span></div><div className="metric-value">{value}</div><div className="metric-foot">{change && <span className="metric-change"><ArrowUpRight size={14} />{change}</span>}<span>{detail}</span></div></article> }
function StatusBadge({ status }: { status: OrderStatus | 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'FAILED' | 'REFUNDED' }) { return <span className={`status-badge status-${status.toLowerCase()}`}><i />{status.replace('_', ' ')}</span> }
function OrderTable({ orders, showStatus = true }: { orders: Order[]; showStatus?: boolean }) { return <div className="table-scroll"><table><thead><tr><th>ORDER</th><th>GUEST / TABLE</th><th>ITEMS</th><th>TOTAL</th>{showStatus && <th>STATUS</th>}<th>TIME</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td><strong className="order-id">{order.id}</strong></td><td><strong>{order.guest}</strong><small>Table {order.table}</small></td><td>{order.items.reduce((sum, item) => sum + item.qty, 0)} items</td><td className="currency">${order.total.toFixed(2)}</td>{showStatus && <td><StatusBadge status={order.status} /></td>}<td className="muted-cell">{order.time}</td></tr>)}</tbody></table>{orders.length === 0 && <div className="empty-state"><ShoppingBag size={22} /><strong>No orders in this view</strong><span>New activity will appear here.</span></div>}</div> }

function AdminApiDashboard() {
  const { user } = useAuth()
  const { notify } = useWorkspace()
  const { section, setSection } = useWorkspace()
  const [users, setUsers] = useState<UserSummary[]>([])
  const [items, setItems] = useState<MenuItemDto[]>([])
  const [categories, setCategories] = useState<MenuCategoryDto[]>([])
  const [orderCount, setOrderCount] = useState(0)
  const [query, setQuery] = useState('')
  const [userLoading, setUserLoading] = useState(true)
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [overviewLoading, setOverviewLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingUser, setEditingUser] = useState<UserSummary | null>(null)
  const [userFormOpen, setUserFormOpen] = useState(false)
  const [userDraft, setUserDraft] = useState({ username: '', displayName: '', password: '', role: 'CUSTOMER' as UserRole })
  const [newCategory, setNewCategory] = useState('')
  const [editingItem, setEditingItem] = useState<MenuItemDto | null>(null)
  const [itemFormOpen, setItemFormOpen] = useState(false)
  const [itemDraft, setItemDraft] = useState({ name: '', description: '', categoryId: '', price: '', imageUrl: '' })

  async function refreshUsers() {
    setUserLoading(true)
    try {
      setUsers((await listUsers({ query: query || undefined, page: 0, size: 100 })).content)
      setError('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load users.')
    } finally { setUserLoading(false) }
  }

  async function refreshCatalog() {
    setCatalogLoading(true)
    try {
      const [nextCategories, nextItems] = await Promise.all([listAdminMenuCategories(), listAdminMenuItems({ page: 0, size: 100 })])
      setCategories(nextCategories)
      setItems(nextItems.content)
      setError('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load the menu catalog.')
    } finally { setCatalogLoading(false) }
  }

  useEffect(() => {
    if (!['overview', 'users'].includes(section)) return
    let active = true
    const timer = window.setTimeout(() => {
      void listUsers({ query: query || undefined, page: 0, size: 100 }).then((result) => {
        if (active) { setUsers(result.content); setUserLoading(false) }
      }).catch((requestError: unknown) => {
        if (active) { setError(requestError instanceof Error ? requestError.message : 'Could not load users.'); setUserLoading(false) }
      })
    }, 100)
    return () => { active = false; window.clearTimeout(timer) }
  }, [section, query])

  useEffect(() => {
    if (!['overview', 'menu'].includes(section)) return
    let active = true
    const timer = window.setTimeout(() => {
      void Promise.all([listAdminMenuCategories(), listAdminMenuItems({ page: 0, size: 100 })]).then(([nextCategories, nextItems]) => {
        if (active) { setCategories(nextCategories); setItems(nextItems.content); setCatalogLoading(false) }
      }).catch((requestError: unknown) => {
        if (active) { setError(requestError instanceof Error ? requestError.message : 'Could not load the menu catalog.'); setCatalogLoading(false) }
      })
    }, 100)
    return () => { active = false; window.clearTimeout(timer) }
  }, [section])

  useEffect(() => {
    if (section !== 'overview') return
    let active = true
    const timer = window.setTimeout(() => {
      void listOrders({ page: 0, size: 1 }).then((result) => {
        if (active) { setOrderCount(result.totalElements); setOverviewLoading(false) }
      }).catch((requestError: unknown) => {
        if (active) { setError(requestError instanceof Error ? requestError.message : 'Could not load system overview.'); setOverviewLoading(false) }
      })
    }, 100)
    return () => { active = false; window.clearTimeout(timer) }
  }, [section])

  function beginCreateUser() {
    setEditingUser(null)
    setUserDraft({ username: '', displayName: '', password: '', role: 'CUSTOMER' })
    setUserFormOpen(true)
  }

  function beginEditUser(account: UserSummary) {
    setEditingUser(account)
    setUserDraft({ username: account.username, displayName: account.displayName, password: '', role: account.role })
    setUserFormOpen(true)
  }

  async function saveUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      if (editingUser) {
        await updateUser(editingUser.id, { username: userDraft.username.trim(), displayName: userDraft.displayName.trim() })
        if (editingUser.role !== userDraft.role) await setUserRole(editingUser.id, userDraft.role)
        if (userDraft.password) await resetUserPassword(editingUser.id, userDraft.password)
      } else {
        await createUser({ ...userDraft, username: userDraft.username.trim(), displayName: userDraft.displayName.trim() })
      }
      setUserFormOpen(false)
      notify(editingUser ? 'Team member updated.' : 'Team member created.')
      await refreshUsers()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not save this user.')
    }
  }

  async function toggleUser(account: UserSummary) {
    if (account.id === user?.id && account.active) { setError('You cannot deactivate your own administrator account.'); return }
    const action = account.active ? 'Deactivate' : 'Activate'
    if (!window.confirm(`${action} ${account.displayName}'s account?`)) return
    try {
      await setUserActive(account.id, !account.active)
      notify(`Account ${account.active ? 'deactivated' : 'activated'}.`)
      await refreshUsers()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update account status.')
    }
  }

  async function addCategory() {
    if (!newCategory.trim()) return
    try {
      await createMenuCategory({ name: newCategory.trim() })
      setNewCategory('')
      notify('Menu category created.')
      await refreshCatalog()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not create category.')
    }
  }

  async function editCategory(category: MenuCategoryDto) {
    const name = window.prompt('Category name', category.name)
    if (!name?.trim()) return
    try {
      await updateMenuCategory(category.id, { name: name.trim(), description: category.description, active: category.active })
      notify('Menu category updated.')
      await refreshCatalog()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update category.')
    }
  }

  async function toggleCategory(category: MenuCategoryDto) {
    if (category.active && !window.confirm(`Disable the ${category.name} category?`)) return
    try {
      await updateMenuCategory(category.id, { name: category.name, description: category.description, active: !category.active })
      notify(`Category ${category.active ? 'disabled' : 'enabled'}.`)
      await refreshCatalog()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update category.')
    }
  }

  function beginCreateItem() {
    setEditingItem(null)
    setItemDraft({ name: '', description: '', categoryId: categories[0]?.id ?? '', price: '', imageUrl: '' })
    setItemFormOpen(true)
  }

  function beginEditItem(item: MenuItemDto) {
    setEditingItem(item)
    setItemDraft({ name: item.name, description: item.description ?? '', categoryId: item.categoryId, price: String(item.price), imageUrl: item.imageUrl ?? '' })
    setItemFormOpen(true)
  }

  async function saveItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload = { ...itemDraft, name: itemDraft.name.trim(), description: itemDraft.description || null, imageUrl: itemDraft.imageUrl || null, price: Number(itemDraft.price) }
    try {
      if (editingItem) await updateMenuItem(editingItem.id, payload)
      else await createMenuItem(payload)
      setItemFormOpen(false)
      notify(editingItem ? 'Menu item updated.' : 'Menu item created.')
      await refreshCatalog()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not save this menu item.')
    }
  }

  async function toggleItem(item: MenuItemDto) {
    if (item.active && !window.confirm(`Disable ${item.name}? It will no longer appear for customers.`)) return
    try {
      await setMenuItemActive(item.id, !item.active)
      notify(`Menu item ${item.active ? 'disabled' : 'enabled'}.`)
      await refreshCatalog()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update menu item.')
    }
  }

  return <><div className="section-tabs">{(['overview', 'users', 'menu'] as const).map((item) => <button className={section === item ? 'section-tab selected' : 'section-tab'} key={item} onClick={() => { setSection(item); setError('') }}>{item === 'users' ? 'User management' : item === 'menu' ? 'Menu & categories' : 'Overview'}</button>)}</div>{error && <p role="alert" className="form-error">{error}</p>}{section === 'overview' && <><PageHeading eyebrow="SYSTEM OVERVIEW · LIVE DATA" title="Restaurant overview" description="Current accounts, orders, and active menu items." action={<button className="button-secondary" onClick={() => setSection('users')}><Users size={16} /> Manage team</button>} />{overviewLoading || userLoading || catalogLoading ? <div className="empty-state">Loading system overview...</div> : <><div className="metric-grid"><MetricCard label="Team members" value={String(users.length).padStart(2, '0')} detail={`${users.filter((entry) => entry.active).length} active`} icon={Users} /><MetricCard label="Orders" value={String(orderCount)} detail="Total orders" icon={ShoppingBag} accent="coral" /><MetricCard label="Menu items" value={String(items.length).padStart(2, '0')} detail={`Across ${categories.length} categories`} icon={Utensils} accent="gold" /><MetricCard label="System health" value="Operational" detail="API connected" icon={ShieldCheck} accent="green" /></div><div className="content-grid admin-overview-grid"><section className="panel"><div className="panel-header"><div><p className="eyebrow">ACCESS CONTROL</p><h2>Team members</h2></div><button className="text-button" onClick={() => setSection('users')}>View team <ArrowRight size={14} /></button></div><div className="table-scroll"><table><thead><tr><th>TEAM MEMBER</th><th>ROLE</th><th>STATUS</th></tr></thead><tbody>{users.slice(0, 5).map((account) => <tr key={account.id}><td><strong>{account.displayName}</strong><small>{account.username}</small></td><td>{roleNames[account.role]}</td><td><StatusBadge status={account.active ? 'ACTIVE' : 'INACTIVE'} /></td></tr>)}</tbody></table></div></section><section className="panel system-panel"><div className="panel-header"><div><p className="eyebrow">CATALOG</p><h2>Menu availability</h2></div><span className="system-pulse" /></div><div className="health-row"><span className="health-icon gold"><Utensils size={17} /></span><span><strong>{items.length} active items</strong><small>{categories.length} active categories</small></span><StatusBadge status="ACTIVE" /></div><div className="panel-bottom-note"><span className="online-dot" /> Live backend data</div></section></div></>}</>}
    {section === 'users' && <><PageHeading eyebrow="ADMINISTRATION · ACCESS CONTROL" title="Team members" description="Manage real backend accounts, roles, and access." action={<button className="button-primary" onClick={beginCreateUser}><Plus size={16} /> Add team member</button>} /><section className="panel data-panel"><div className="table-toolbar"><div className="search-field"><Search size={16} /><input placeholder="Search team members" value={query} onChange={(event) => { setQuery(event.target.value); setUserLoading(true) }} /></div><span className="toolbar-count">{users.length} ACCOUNTS</span></div>{userLoading ? <div className="empty-state">Loading team members...</div> : <div className="table-scroll"><table><thead><tr><th>TEAM MEMBER</th><th>USERNAME</th><th>ROLE</th><th>STATUS</th><th className="align-right">ACTIONS</th></tr></thead><tbody>{users.map((account) => <tr key={account.id}><td><div className="table-person"><span className="table-avatar">{account.displayName.split(' ').map((part) => part[0]).join('')}</span><strong>{account.displayName}</strong></div></td><td className="muted-cell">{account.username}</td><td><span className="role-chip">{roleNames[account.role]}</span></td><td><StatusBadge status={account.active ? 'ACTIVE' : 'INACTIVE'} /></td><td><div className="row-actions"><button className="text-button compact" onClick={() => beginEditUser(account)}>Edit</button><button className="text-button compact" onClick={() => void toggleUser(account)}>{account.active ? 'Deactivate' : 'Activate'}</button></div></td></tr>)}</tbody></table>{users.length === 0 && <div className="empty-state"><Users size={22} /><strong>No team members found</strong><span>Try another search term.</span></div>}</div>}</section></>}
    {section === 'menu' && <><PageHeading eyebrow="ADMINISTRATION · CATALOG" title="Menu & categories" description="Manage the live customer catalog." action={<button className="button-primary" onClick={beginCreateItem} disabled={!categories.some((category) => category.active)}><Plus size={16} /> Add menu item</button>} /><div className="metric-grid category-grid">{categories.map((category, index) => <div className="category-tile" key={category.id}><span className="category-number">{String(index + 1).padStart(2, '0')}</span><strong>{category.name}</strong><small>{items.filter((item) => item.categoryId === category.id).length} items · {category.active ? 'active' : 'inactive'}</small><div className="row-actions"><button className="text-button compact" onClick={() => void editCategory(category)}>Rename</button><button className="text-button compact" onClick={() => void toggleCategory(category)}>{category.active ? 'Disable' : 'Enable'}</button></div></div>)}</div><section className="panel data-panel"><div className="table-toolbar"><div className="search-field"><Search size={16} /><input placeholder="Search menu items" value={query} onChange={(event) => setQuery(event.target.value)} /></div><div className="inline-add"><input aria-label="New menu category name" placeholder="New category" value={newCategory} onChange={(event) => setNewCategory(event.target.value)} /><button className="icon-button" title="Add category" onClick={() => void addCategory()}><Plus size={17} /></button></div></div>{catalogLoading ? <div className="empty-state">Loading menu catalog...</div> : <div className="table-scroll"><table><thead><tr><th>ITEM</th><th>CATEGORY</th><th>PRICE</th><th>AVAILABILITY</th><th></th></tr></thead><tbody>{items.filter((item) => item.name.toLowerCase().includes(query.toLowerCase())).map((item) => <tr key={item.id}><td><strong>{item.name}</strong><small>{item.description}</small></td><td>{item.categoryName}</td><td className="currency">${item.price.toFixed(2)}</td><td><StatusBadge status={item.active ? 'ACTIVE' : 'INACTIVE'} /></td><td><div className="row-actions"><button className="text-button compact" onClick={() => beginEditItem(item)}>Edit</button><button className="text-button compact" onClick={() => void toggleItem(item)}>{item.active ? 'Disable' : 'Enable'}</button></div></td></tr>)}</tbody></table>{items.length === 0 && <div className="empty-state"><Utensils size={22} /><strong>No menu items</strong></div>}</div>}</section></>}
    {userFormOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setUserFormOpen(false) }}><form className="modal" onSubmit={(event) => void saveUser(event)}><div className="modal-heading"><div><p className="eyebrow">TEAM ACCESS</p><h2>{editingUser ? 'Edit team member' : 'Add team member'}</h2></div><button type="button" className="icon-button" aria-label="Close" onClick={() => setUserFormOpen(false)}><X size={18} /></button></div><label>Display name<input required value={userDraft.displayName} onChange={(event) => setUserDraft({ ...userDraft, displayName: event.target.value })} /></label><label>Username<input required value={userDraft.username} onChange={(event) => setUserDraft({ ...userDraft, username: event.target.value })} /></label><label>{editingUser ? 'Reset password (optional)' : 'Temporary password'}<input required={!editingUser} minLength={12} maxLength={72} type="password" value={userDraft.password} onChange={(event) => setUserDraft({ ...userDraft, password: event.target.value })} /></label><label>Role<select value={userDraft.role} onChange={(event) => setUserDraft({ ...userDraft, role: event.target.value as UserRole })}>{USER_ROLES.map((role) => <option key={role} value={role}>{roleNames[role]}</option>)}</select></label><p className="modal-note">The backend stores only a BCrypt password hash. Passwords are never returned by the API.</p><div className="modal-actions"><button type="button" className="button-secondary" onClick={() => setUserFormOpen(false)}>Cancel</button><button type="submit" className="button-primary">{editingUser ? 'Save changes' : 'Create account'}</button></div></form></div>}
    {itemFormOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setItemFormOpen(false) }}><form className="modal" onSubmit={(event) => void saveItem(event)}><div className="modal-heading"><div><p className="eyebrow">MENU CATALOG</p><h2>{editingItem ? 'Edit menu item' : 'Add menu item'}</h2></div><button type="button" className="icon-button" aria-label="Close" onClick={() => setItemFormOpen(false)}><X size={18} /></button></div><label>Item name<input required maxLength={120} value={itemDraft.name} onChange={(event) => setItemDraft({ ...itemDraft, name: event.target.value })} /></label><label>Description<input maxLength={1000} value={itemDraft.description} onChange={(event) => setItemDraft({ ...itemDraft, description: event.target.value })} /></label><label>Category<select required value={itemDraft.categoryId} onChange={(event) => setItemDraft({ ...itemDraft, categoryId: event.target.value })}>{categories.filter((category) => category.active).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label>Price<input required min="0.01" step="0.01" type="number" value={itemDraft.price} onChange={(event) => setItemDraft({ ...itemDraft, price: event.target.value })} /></label><label>Image URL<input maxLength={1000} value={itemDraft.imageUrl} onChange={(event) => setItemDraft({ ...itemDraft, imageUrl: event.target.value })} /></label><div className="modal-actions"><button type="button" className="button-secondary" onClick={() => setItemFormOpen(false)}>Cancel</button><button type="submit" className="button-primary">{editingItem ? 'Save changes' : 'Create item'}</button></div></form></div>}
  </>
}
function AdminDashboard() {
  const { orders, notify, section, setSection } = useWorkspace()
  const { accounts, updateAccounts } = useAuth()
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<DemoAccount | null>(null)
  const [showUserForm, setShowUserForm] = useState(false)
  const [draft, setDraft] = useState({ username: '', password: '', displayName: '', role: 'CUSTOMER' as UserRole })
  const [menuQuery, setMenuQuery] = useState('')
  const [items, setItems] = useState(menuItems)
  const [newItem, setNewItem] = useState('')
  const visibleAccounts = accounts.filter((account) => `${account.username} ${account.displayName} ${account.role}`.toLowerCase().includes(query.toLowerCase()))
  function saveAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const username = draft.username.trim()
    if (accounts.some((account) => account.username.toLowerCase() === username.toLowerCase() && account.id !== editing?.id)) { notify('That username is already in use.'); return }
    const next = editing ? accounts.map((account) => account.id === editing.id ? { ...account, ...draft, username } : account) : [...accounts, { id: `user-${crypto.randomUUID()}`, ...draft, username, active: true }]
    updateAccounts(next); setShowUserForm(false); setEditing(null); notify(editing ? 'Team member updated.' : 'Team member added.')
  }
  function editAccount(account: DemoAccount) { setEditing(account); setDraft({ username: account.username, password: account.password, displayName: account.displayName, role: account.role }); setShowUserForm(true) }
  function addItem() { if (!newItem.trim()) { notify('Enter an item name first.'); return } setItems([...items, { id: crypto.randomUUID(), name: newItem.trim(), category: 'Mains', price: 18, description: 'New menu item', image: 'photo-1547592180-85f173990554' }]); setNewItem(''); notify('Menu item added.') }
  return <>
    <div className="section-tabs">{(['overview', 'users', 'menu'] as const).map((item) => <button className={section === item ? 'section-tab selected' : 'section-tab'} key={item} onClick={() => setSection(item)}>{item === 'users' ? 'User management' : item === 'menu' ? 'Menu & categories' : 'Overview'}</button>)}</div>
    {section === 'overview' && <><PageHeading eyebrow="SYSTEM OVERVIEW · MONDAY, OCTOBER 14" title="Good afternoon, Alex" description="Here’s what’s happening across Linden House today." action={<button className="button-secondary" onClick={() => setSection('users')}><Users size={16} /> Manage team</button>} /><div className="metric-grid"><MetricCard label="Team members" value={String(accounts.length).padStart(2, '0')} change="2 added" detail="Across 6 roles" icon={Users} /><MetricCard label="Orders today" value="128" change="12.8%" detail="vs. last Monday" icon={ShoppingBag} accent="coral" /><MetricCard label="Menu items" value={String(items.length + 18).padStart(2, '0')} detail="Across 4 categories" icon={Utensils} accent="gold" /><MetricCard label="System health" value="All clear" detail="Last checked just now" icon={ShieldCheck} accent="green" /></div><div className="content-grid admin-overview-grid"><section className="panel"><div className="panel-header"><div><p className="eyebrow">LIVE ACTIVITY</p><h2>Recent orders</h2></div><button className="text-button" onClick={() => notify('Showing the latest orders.')}>View all <ArrowRight size={14} /></button></div><OrderTable orders={orders.slice(0, 4)} /></section><section className="panel system-panel"><div className="panel-header"><div><p className="eyebrow">SYSTEM STATUS</p><h2>Everything in place</h2></div><span className="system-pulse" /></div><HealthRow icon={<ShieldCheck size={17} />} title="Order processing" detail="Working normally" color="green" /><HealthRow icon={<Utensils size={17} />} title="Menu availability" detail={`${items.length + 18} items listed`} color="gold" /><HealthRow icon={<Users size={17} />} title="Staff accounts" detail={`${accounts.filter((account) => account.active).length} active accounts`} color="blue" /><div className="panel-bottom-note"><span className="online-dot" /> All systems operational</div></section></div></>}
    {section === 'users' && <><PageHeading eyebrow="ADMINISTRATION · ACCESS CONTROL" title="Team members" description="Manage account access and roles for your restaurant." action={<button className="button-primary" onClick={() => { setEditing(null); setDraft({ username: '', password: '', displayName: '', role: 'CUSTOMER' }); setShowUserForm(true) }}><Plus size={16} /> Add team member</button>} /><section className="panel data-panel"><div className="table-toolbar"><div className="search-field"><Search size={16} /><input placeholder="Search team members" value={query} onChange={(event) => setQuery(event.target.value)} /></div><span className="toolbar-count">{accounts.length} ACCOUNTS</span></div><div className="table-scroll"><table><thead><tr><th>TEAM MEMBER</th><th>USERNAME</th><th>ROLE</th><th>STATUS</th><th className="align-right">ACTIONS</th></tr></thead><tbody>{visibleAccounts.map((account) => <tr key={account.id}><td><div className="table-person"><span className="table-avatar">{account.displayName.split(' ').map((part) => part[0]).join('')}</span><strong>{account.displayName}</strong></div></td><td className="muted-cell">{account.username}</td><td><span className="role-chip">{roleNames[account.role]}</span></td><td><StatusBadge status={account.active ? 'ACTIVE' : 'INACTIVE'} /></td><td><div className="row-actions"><button className="text-button compact" onClick={() => editAccount(account)}>Edit</button><button className="text-button compact" onClick={() => { updateAccounts(accounts.map((entry) => entry.id === account.id ? { ...entry, active: !entry.active } : entry)); notify(account.active ? 'Account deactivated.' : 'Account activated.') }}>{account.active ? 'Deactivate' : 'Activate'}</button><button className="text-button compact danger-text" onClick={() => { if (window.confirm(`Delete ${account.displayName}'s demo account?`)) { updateAccounts(accounts.filter((entry) => entry.id !== account.id)); notify('Demo account deleted.') } }}>Delete</button></div></td></tr>)}</tbody></table>{visibleAccounts.length === 0 && <div className="empty-state"><Users size={22} /><strong>No team members found</strong><span>Try another search term.</span></div>}</div></section></>}
    {section === 'menu' && <><PageHeading eyebrow="ADMINISTRATION · CATALOG" title="Menu & categories" description="Keep the dining room menu clear, current, and ready for service." action={<button className="button-primary" onClick={addItem}><Plus size={16} /> Add menu item</button>} /><div className="metric-grid category-grid"><CategoryTile number="01" title="Starters" count="8 items" /><CategoryTile number="02" title="Mains" count="12 items" /><CategoryTile number="03" title="Desserts" count="6 items" /><CategoryTile number="04" title="Drinks" count="9 items" /></div><section className="panel data-panel"><div className="table-toolbar"><div className="search-field"><Search size={16} /><input placeholder="Search menu items" value={menuQuery} onChange={(event) => setMenuQuery(event.target.value)} /></div><div className="inline-add"><input aria-label="New menu item name" placeholder="New item name" value={newItem} onChange={(event) => setNewItem(event.target.value)} /><button className="icon-button" title="Add item" onClick={addItem}><Plus size={17} /></button></div></div><div className="table-scroll"><table><thead><tr><th>ITEM</th><th>CATEGORY</th><th>PRICE</th><th>AVAILABILITY</th><th></th></tr></thead><tbody>{items.filter((item) => item.name.toLowerCase().includes(menuQuery.toLowerCase())).map((item) => <tr key={item.id}><td><strong>{item.name}</strong><small>{item.description}</small></td><td>{item.category}</td><td className="currency">${item.price.toFixed(2)}</td><td><StatusBadge status="ACTIVE" /></td><td><button className="text-button compact danger-text" onClick={() => { setItems(items.filter((entry) => entry.id !== item.id)); notify('Menu item removed.') }}>Remove</button></td></tr>)}</tbody></table></div></section></>}
    {showUserForm && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowUserForm(false) }}><form className="modal" onSubmit={saveAccount}><div className="modal-heading"><div><p className="eyebrow">TEAM ACCESS</p><h2>{editing ? 'Edit team member' : 'Add team member'}</h2></div><button type="button" className="icon-button" aria-label="Close" onClick={() => setShowUserForm(false)}><X size={18} /></button></div><label>Display name<input required value={draft.displayName} onChange={(event) => setDraft({ ...draft, displayName: event.target.value })} /></label><label>Username<input required value={draft.username} onChange={(event) => setDraft({ ...draft, username: event.target.value })} /></label><label>Demo password<input required type="password" value={draft.password} onChange={(event) => setDraft({ ...draft, password: event.target.value })} /></label><label>Role<select value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value as UserRole })}>{USER_ROLES.map((role) => <option key={role} value={role}>{roleNames[role]}</option>)}</select></label><p className="modal-note">Demo accounts are local to this development session. Never use production passwords here.</p><div className="modal-actions"><button type="button" className="button-secondary" onClick={() => setShowUserForm(false)}>Cancel</button><button type="submit" className="button-primary">{editing ? 'Save changes' : 'Create account'}</button></div></form></div>}
  </>
}
function HealthRow({ icon, title, detail, color }: { icon: React.ReactNode; title: string; detail: string; color: string }) { return <div className="health-row"><span className={`health-icon ${color}`}>{icon}</span><span><strong>{title}</strong><small>{detail}</small></span><StatusBadge status="ACTIVE" /></div> }
function CategoryTile({ number, title, count }: { number: string; title: string; count: string }) { return <div className="category-tile"><span className="category-number">{number}</span><strong>{title}</strong><small>{count}</small></div> }

function ManagerDashboard() {
  const { orders } = useWorkspace(); const [period, setPeriod] = useState('Today'); const bars = [30, 42, 36, 58, 46, 64, 52, 75, 58, 88, 69, 96]
  return <><PageHeading eyebrow="PERFORMANCE · MONDAY, OCTOBER 14" title="Service at a glance" description="A clear picture of how the restaurant is moving today." action={<label className="select-control"><span>PERIOD</span><select value={period} onChange={(event) => setPeriod(event.target.value)}><option>Today</option><option>This week</option><option>This month</option></select><ChevronDown size={14} /></label>} /><div className="metric-grid"><MetricCard label="Total revenue" value={period === 'Today' ? '$4,286' : period === 'This week' ? '$24,610' : '$86,420'} change="8.4%" detail="vs. previous period" icon={CircleDollarSign} /><MetricCard label="Total orders" value={period === 'Today' ? '128' : period === 'This week' ? '746' : '2,318'} change="12.8%" detail="vs. previous period" icon={ShoppingBag} accent="coral" /><MetricCard label="Average order value" value="$33.48" change="2.1%" detail="per completed order" icon={ArrowUpRight} accent="gold" /></div><div className="content-grid manager-grid"><section className="panel revenue-panel"><div className="panel-header"><div><p className="eyebrow">REVENUE TREND</p><h2>Today's performance</h2></div><div className="chart-legend"><span /> Revenue <strong>+$4,286</strong></div></div><div className="chart-area"><div className="chart-y-labels"><span>$1,000</span><span>$750</span><span>$500</span><span>$250</span><span>$0</span></div><div className="chart-plot"><div className="chart-gridlines"><i /><i /><i /><i /><i /></div><div className="chart-bars">{bars.map((bar, index) => <div className="chart-column" key={index}><span style={{ height: `${bar}%` }} className={index === 9 ? 'chart-bar highlighted' : 'chart-bar'} /><small>{['9a', '', '11a', '', '1p', '', '3p', '', '5p', '', '7p', ''][index]}</small></div>)}</div></div></div><div className="chart-foot"><span>Lunch service peak <strong>1:00 PM</strong></span><span><ArrowUpRight size={14} /> 8.4% from yesterday</span></div></section><section className="panel service-summary"><div className="panel-header"><div><p className="eyebrow">SERVICE PULSE</p><h2>On the floor</h2></div><span className="online-dot" /></div><div className="pulse-stat"><div className="pulse-number">06<span> / 12</span></div><span>Tables occupied</span><div className="occupancy-track"><i style={{ width: '50%' }} /></div></div><div className="pulse-row"><span>Orders in progress</span><strong>08</strong></div><div className="pulse-row"><span>Avg. ticket time</span><strong>18 min</strong></div><div className="pulse-row"><span>Staff on shift</span><strong>12</strong></div><div className="service-note"><Clock3 size={15} /> Lunch service · 11:30 AM – 3:00 PM</div></section></div><section className="panel recent-orders"><div className="panel-header"><div><p className="eyebrow">LIVE SERVICE</p><h2>Recent orders <span className="live-label"><i /> LIVE</span></h2></div><button className="text-button" onClick={() => setPeriod('Today')}>Today <ChevronDown size={14} /></button></div><OrderTable orders={orders.slice(0, 5)} /></section></>
}

function getPeriodDates(period: string) {
  const today = new Date()
  const to = today.toISOString().slice(0, 10)
  const fromDate = new Date(today)
  if (period === 'This week') {
    const weekday = (today.getDay() + 6) % 7
    fromDate.setDate(today.getDate() - weekday)
  } else if (period === 'This month') {
    fromDate.setDate(1)
  }
  return { from: fromDate.toISOString().slice(0, 10), to }
}

function ManagerApiDashboard() {
  const [period, setPeriod] = useState('Today')
  const [dashboard, setDashboard] = useState<ManagerDashboardDto | null>(null)
  const [points, setPoints] = useState<RevenuePointDto[]>([])
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [periodOrderCount, setPeriodOrderCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const range = getPeriodDates(period)

  useEffect(() => {
    let active = true
    const timer = window.setTimeout(() => {
      void Promise.all([
        getManagerDashboard(range.from, range.to),
        getManagerRevenue(range.from, range.to),
        listManagerOrders({ from: range.from, to: range.to, page: 0, size: 5 }),
      ]).then(([summary, revenue, orders]) => {
        if (!active) return
        setDashboard(summary)
        setPoints(revenue.points)
        setRecentOrders(orders.content.map(mapOrder))
        setPeriodOrderCount(summary.totalOrders)
        setError('')
        setLoading(false)
      }).catch((requestError: unknown) => {
        if (!active) return
        setError(requestError instanceof Error ? requestError.message : 'Could not load manager reports.')
        setLoading(false)
      })
    }, 0)
    return () => { active = false; window.clearTimeout(timer) }
  }, [range.from, range.to])

  const periodRevenue = period === 'Today' ? dashboard?.totalRevenue ?? 0 : points.reduce((sum, point) => sum + point.revenue, 0)
  const averageOrderValue = periodOrderCount === 0 ? 0 : periodRevenue / periodOrderCount
  const maxRevenue = Math.max(1, ...points.map((point) => point.revenue))
  const bars = points.slice(-12).map((point) => ({
    height: `${Math.max(4, (point.revenue / maxRevenue) * 96)}%`,
    label: new Date(`${point.date}T00:00:00`).toLocaleDateString([], { day: 'numeric', month: 'short' }),
    value: point.revenue,
  }))

  return <><PageHeading eyebrow="PERFORMANCE · LIVE REPORT" title="Service at a glance" description="Revenue and order activity from completed payments." action={<label className="select-control"><span>PERIOD</span><select value={period} onChange={(event) => { setLoading(true); setPeriod(event.target.value) }}><option>Today</option><option>This week</option><option>This month</option></select><ChevronDown size={14} /></label>} />{error && <p role="alert" className="form-error">{error}</p>}{loading ? <div className="empty-state page-empty">Loading manager reports...</div> : <><div className="metric-grid"><MetricCard label="Total revenue" value={`$${periodRevenue.toFixed(2)}`} detail="Successful payments" icon={CircleDollarSign} /><MetricCard label="Total orders" value={String(periodOrderCount)} detail="Paid orders in period" icon={ShoppingBag} accent="coral" /><MetricCard label="Average order value" value={`$${averageOrderValue.toFixed(2)}`} detail="Per paid order" icon={ArrowUpRight} accent="gold" /></div><div className="content-grid manager-grid"><section className="panel revenue-panel"><div className="panel-header"><div><p className="eyebrow">REVENUE TREND</p><h2>{period} performance</h2></div><div className="chart-legend"><span /> Revenue <strong>${periodRevenue.toFixed(2)}</strong></div></div>{bars.length === 0 ? <div className="empty-state">No successful payments in this period.</div> : <><div className="chart-area"><div className="chart-y-labels"><span>${maxRevenue.toFixed(0)}</span><span>${(maxRevenue * .75).toFixed(0)}</span><span>${(maxRevenue * .5).toFixed(0)}</span><span>${(maxRevenue * .25).toFixed(0)}</span><span>$0</span></div><div className="chart-plot"><div className="chart-gridlines"><i /><i /><i /><i /><i /></div><div className="chart-bars">{bars.map((bar, index) => <div className="chart-column" key={`${bar.label}-${index}`} title={`$${bar.value.toFixed(2)}`}><span style={{ height: bar.height }} className={index === bars.length - 1 ? 'chart-bar highlighted' : 'chart-bar'} /><small>{bar.label}</small></div>)}</div></div></div><div className="chart-foot"><span>Range <strong>{range.from} – {range.to}</strong></span><span>{points.length} daily points</span></div></>}</section><section className="panel service-summary"><div className="panel-header"><div><p className="eyebrow">REPORT RANGE</p><h2>{period}</h2></div><span className="online-dot" /></div><div className="pulse-stat"><div className="pulse-number">{periodOrderCount}</div><span>successful payments</span></div><div className="pulse-row"><span>Revenue</span><strong>${periodRevenue.toFixed(2)}</strong></div><div className="pulse-row"><span>Average</span><strong>${averageOrderValue.toFixed(2)}</strong></div><div className="service-note"><Clock3 size={15} /> Payment timestamp · UTC report dates</div></section></div><section className="panel recent-orders"><div className="panel-header"><div><p className="eyebrow">SERVICE ACTIVITY</p><h2>Recent orders</h2></div><span className="toolbar-count">{recentOrders.length} RECENT</span></div><OrderTable orders={recentOrders} /></section></>}</>
}

function CashierDashboard() {
  const { orders, setOrders, notify } = useWorkspace(); const [selected, setSelected] = useState<Order | null>(null)
  const pending = orders.filter((order) => order.status !== 'PAID'); const paid = orders.filter((order) => order.status === 'PAID')
  function pay(order: Order) { if (!window.confirm(`Record simulated payment of $${order.total.toFixed(2)} for ${order.id}?`)) return; setOrders(orders.map((entry) => entry.id === order.id ? { ...entry, status: 'PAID' } : entry)); setSelected(null); notify('Simulated payment recorded.') }
  return <><PageHeading eyebrow="FRONT OF HOUSE · BILLING" title="Billing desk" description="Review open checks and record simulated payments." action={<span className="simulation-label"><span /> SIMULATED PAYMENTS</span>} /><div className="metric-grid"><MetricCard label="Pending bills" value={String(pending.length).padStart(2, '0')} detail="Awaiting payment" icon={CreditCard} /><MetricCard label="Outstanding total" value={`$${pending.reduce((sum, order) => sum + order.total, 0).toFixed(2)}`} detail="Across open checks" icon={CircleDollarSign} accent="coral" /><MetricCard label="Paid today" value={String(paid.length).padStart(2, '0')} detail={`$${paid.reduce((sum, order) => sum + order.total, 0).toFixed(2)} collected`} icon={Check} accent="green" /></div><div className="cashier-layout"><section className="panel"><div className="panel-header"><div><p className="eyebrow">OPEN CHECKS</p><h2>Ready for payment</h2></div><span className="toolbar-count">{pending.length} OPEN</span></div><div className="bill-list">{pending.map((order) => <article className={`bill-row ${selected?.id === order.id ? 'bill-selected' : ''}`} key={order.id}><div className="bill-main"><span className="bill-table">T{order.table}</span><div><strong>{order.guest}</strong><small>{order.id} · {order.items.reduce((sum, item) => sum + item.qty, 0)} items</small></div></div><strong className="currency">${order.total.toFixed(2)}</strong><button className="button-secondary bill-details" onClick={() => setSelected(selected?.id === order.id ? null : order)}>{selected?.id === order.id ? 'Close' : 'Details'}</button></article>)}{pending.length === 0 && <div className="empty-state"><Check size={22} /><strong>All checks are settled</strong><span>There are no open bills right now.</span></div>}</div></section><section className="panel payment-panel"><div className="panel-header"><div><p className="eyebrow">CHECK DETAILS</p><h2>{selected ? selected.id : 'Select a bill'}</h2></div></div>{selected ? <><div className="bill-detail-meta"><span>TABLE {selected.table}</span><span>{selected.guest}</span></div><div className="bill-items">{selected.items.map((item) => <div key={item.name}><span>{item.qty} × {item.name}</span><span>${(item.qty * selected.total / selected.items.reduce((sum, line) => sum + line.qty, 0)).toFixed(2)}</span></div>)}</div><div className="bill-total"><span>Grand total</span><strong>${selected.total.toFixed(2)}</strong></div><button className="button-primary full-width" onClick={() => pay(selected)}><CreditCard size={16} /> Record simulated payment</button><p className="simulation-caption">This records a local demo status only. No payment is processed.</p></> : <div className="select-bill-empty"><CreditCard size={25} /><span>Choose an open check<br />to see item details.</span></div>}</section></div><section className="panel recent-orders"><div className="panel-header"><div><p className="eyebrow">PAYMENT HISTORY</p><h2>Recent payments</h2></div><span className="toolbar-count">{paid.length} SETTLED</span></div><OrderTable orders={paid} /></section></>
}

function CashierApiDashboard() {
  const { notify } = useWorkspace()
  const [pending, setPending] = useState<Order[]>([])
  const [payments, setPayments] = useState<PaymentDto[]>([])
  const [selected, setSelected] = useState<Order | null>(null)
  const [method, setMethod] = useState<'CASH' | 'CARD'>('CASH')
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')

  async function refresh() {
    setLoading(true)
    try {
      const [orders, history] = await Promise.all([listPendingCashierOrders(), listPayments(0, 25)])
      setPending(orders.map(mapOrder))
      setPayments(history.content)
      setError('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load cashier data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const [orders, history] = await Promise.all([listPendingCashierOrders(), listPayments(0, 25)])
        if (!active) return
        setPending(orders.map(mapOrder))
        setPayments(history.content)
        setError('')
        setLoading(false)
      } catch (requestError) {
        if (!active) return
        setError(requestError instanceof Error ? requestError.message : 'Could not load cashier data.')
        setLoading(false)
      }
    }
    const timer = window.setTimeout(() => void load(), 0)
    return () => { active = false; window.clearTimeout(timer) }
  }, [])

  async function pay(order: Order) {
    if (!window.confirm(`Record simulated ${method.toLowerCase()} payment of $${order.total.toFixed(2)} for ${order.id}?`)) return
    setPaying(true)
    try {
      await recordSimulatedPayment(order.backendId ?? order.id, method)
      setSelected(null)
      notify('Simulated payment recorded.')
      await refresh()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not record this payment.')
    } finally {
      setPaying(false)
    }
  }

  return <><PageHeading eyebrow="FRONT OF HOUSE · BILLING" title="Billing desk" description="Review served checks and record simulated payments." action={<span className="simulation-label"><span /> SIMULATED PAYMENTS</span>} />{error && <p role="alert" className="form-error">{error}</p>}{loading ? <div className="empty-state page-empty">Loading cashier desk...</div> : <><div className="metric-grid"><MetricCard label="Pending bills" value={String(pending.length).padStart(2, '0')} detail="Served and awaiting payment" icon={CreditCard} /><MetricCard label="Outstanding total" value={`$${pending.reduce((sum, order) => sum + order.total, 0).toFixed(2)}`} detail="Server-calculated amount" icon={CircleDollarSign} accent="coral" /><MetricCard label="Recent payments" value={String(payments.length).padStart(2, '0')} detail={`Latest 25 records · $${payments.reduce((sum, payment) => sum + payment.amount, 0).toFixed(2)}`} icon={Check} accent="green" /></div><div className="cashier-layout"><section className="panel"><div className="panel-header"><div><p className="eyebrow">SERVED · UNPAID</p><h2>Ready for payment</h2></div><span className="toolbar-count">{pending.length} OPEN</span></div><div className="bill-list">{pending.map((order) => <article className={`bill-row ${selected?.id === order.id ? 'bill-selected' : ''}`} key={order.id}><div className="bill-main"><span className="bill-table">T{order.table}</span><div><strong>{order.guest}</strong><small>{order.id} · {order.items.reduce((sum, item) => sum + item.qty, 0)} items</small></div></div><strong className="currency">${order.total.toFixed(2)}</strong><button className="button-secondary bill-details" onClick={() => setSelected(selected?.id === order.id ? null : order)}>{selected?.id === order.id ? 'Close' : 'Details'}</button></article>)}{pending.length === 0 && <div className="empty-state"><Check size={22} /><strong>All checks are settled</strong><span>There are no served, unpaid orders right now.</span></div>}</div></section><section className="panel payment-panel"><div className="panel-header"><div><p className="eyebrow">CHECK DETAILS</p><h2>{selected ? selected.id : 'Select a bill'}</h2></div></div>{selected ? <><div className="bill-detail-meta"><span>TABLE {selected.table}</span><span>{selected.guest}</span></div><div className="bill-items">{selected.items.map((item) => <div key={item.name}><span>{item.qty} × {item.name}</span><span>${(item.lineTotal ?? 0).toFixed(2)}</span></div>)}</div><div className="bill-total"><span>Grand total</span><strong>${selected.total.toFixed(2)}</strong></div><label className="table-select">SIMULATED METHOD<select value={method} onChange={(event) => setMethod(event.target.value as 'CASH' | 'CARD')}><option value="CASH">Cash</option><option value="CARD">Card</option></select><ChevronDown size={15} /></label><button className="button-primary full-width" disabled={paying} onClick={() => void pay(selected)}><CreditCard size={16} /> {paying ? 'Recording...' : 'Record simulated payment'}</button><p className="simulation-caption">No real payment is processed. The server owns amount and payment status.</p></> : <div className="select-bill-empty"><CreditCard size={25} /><span>Choose an open check<br />to see item details.</span></div>}</section></div><section className="panel recent-orders"><div className="panel-header"><div><p className="eyebrow">PAYMENT HISTORY</p><h2>Recent payments</h2></div><span className="toolbar-count">{payments.length} RECORDED</span></div><div className="table-scroll"><table><thead><tr><th>PAYMENT</th><th>ORDER</th><th>METHOD</th><th>AMOUNT</th><th>STATUS</th><th>TIME</th></tr></thead><tbody>{payments.map((payment) => <tr key={payment.id}><td><strong className="order-id">{payment.id.slice(0, 8)}</strong></td><td><strong>{payment.orderNumber}</strong></td><td>{payment.method}</td><td className="currency">${payment.amount.toFixed(2)}</td><td><StatusBadge status={payment.status} /></td><td className="muted-cell">{new Date(payment.createdAt).toLocaleString()}</td></tr>)}</tbody></table>{payments.length === 0 && <div className="empty-state"><CreditCard size={22} /><strong>No payments recorded</strong></div>}</div></section></>}</>
}

function WaiterDashboard() {
  const { orders: demoOrders, setOrders, notify, section, setSection } = useWorkspace()
  const { mode } = useAuth()
  const [filter, setFilter] = useState('All orders')
  const [apiOrders, setApiOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(mode === 'api')
  const [error, setError] = useState('')
  const orders = mode === 'demo' ? demoOrders : apiOrders
  const activeFilter = section === 'all-orders' ? 'All orders' : filter
  const filtered = mode === 'demo'
    ? orders.filter((order) => activeFilter === 'All orders' || order.status === activeFilter.toUpperCase())
    : orders

  async function refreshOrders() {
    if (mode === 'demo') return
    setLoading(true)
    try {
      const status = activeFilter === 'All orders' ? undefined : activeFilter as 'READY' | 'SERVED'
      setApiOrders((await listWaiterOrders(status)).map(mapOrder))
      setError('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load service orders.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (mode === 'demo') return
    let active = true
    const load = () => {
      const status = activeFilter === 'All orders' ? undefined : activeFilter as 'READY' | 'SERVED'
      void listWaiterOrders(status).then((result) => {
        if (!active) return
        setApiOrders(result.map(mapOrder))
        setError('')
        setLoading(false)
      }).catch((requestError: unknown) => {
        if (!active) return
        setError(requestError instanceof Error ? requestError.message : 'Could not load service orders.')
        setLoading(false)
      })
    }
    const initialLoad = window.setTimeout(load, 0)
    const timer = window.setInterval(load, 15000)
    return () => { active = false; window.clearTimeout(initialLoad); window.clearInterval(timer) }
  }, [mode, filter, section, activeFilter])

  async function markServed(order: Order) {
    if (mode === 'demo') {
      setOrders(demoOrders.map((entry) => entry.id === order.id ? { ...entry, status: 'SERVED' } : entry))
      notify(`${order.id} marked as served.`)
      return
    }
    try {
      await serveOrder(order.backendId ?? order.id)
      notify(`${order.id} marked as served.`)
      await refreshOrders()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not serve this order.')
    }
  }

  return <><PageHeading eyebrow="FRONT OF HOUSE · TABLE SERVICE" title="Service board" description="Keep a pulse on every table and deliver each plate at its best." action={<label className="select-control"><span>SHOW</span><select value={activeFilter} onChange={(event) => { setFilter(event.target.value); setSection('overview'); setLoading(true) }}><option>All orders</option><option>READY</option><option>SERVED</option>{mode === 'demo' && <><option>PREPARING</option><option>RECEIVED</option></>}</select><ChevronDown size={14} /></label>} />{error && <p role="alert" className="form-error">{error}</p>}<div className="service-strip"><div><span className="service-strip-icon"><Utensils size={17} /></span><strong>{orders.filter((order) => order.status === 'READY').length} orders ready</strong><span>Pick up from pass when you’re set.</span></div><span className="service-strip-time"><span className="online-dot" /> SERVICE LIVE</span></div>{loading ? <div className="empty-state page-empty">Loading service orders...</div> : <div className="waiter-orders">{filtered.map((order) => <article className="order-card" key={order.id}><div className="order-card-top"><div><span className="order-id">{order.id}</span><StatusBadge status={order.status} /></div><span className="order-time"><Clock3 size={13} /> {order.time}</span></div><div className="table-number"><span>TABLE</span><strong>{String(order.table).padStart(2, '0')}</strong></div><p className="order-guest">{order.guest}</p><div className="order-card-items">{order.items.map((item) => <div key={item.name}><span><b>{item.qty}×</b> {item.name}</span><ChevronDown size={13} /></div>)}</div><div className="order-card-footer"><strong>${order.total.toFixed(2)}</strong>{order.status === 'READY' ? <button className="button-primary small-button" onClick={() => void markServed(order)}><Check size={14} /> Mark served</button> : <span className="card-updated">{order.status === 'SERVED' ? 'Delivered to table' : 'In the kitchen'}</span>}</div></article>)}</div>}{!loading && filtered.length === 0 && <div className="empty-state page-empty"><ShoppingBag size={22} /><strong>No orders match this status</strong><span>Select another filter to see more.</span></div>}</>
}

function KitchenDashboard() {
  const { orders: demoOrders, setOrders, notify } = useWorkspace()
  const { mode } = useAuth()
  const [apiOrders, setApiOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(mode === 'api')
  const [error, setError] = useState('')
  const orders = mode === 'demo' ? demoOrders : apiOrders
  const columns: { status: OrderStatus; label: string }[] = [{ status: 'RECEIVED', label: 'Incoming' }, { status: 'PREPARING', label: 'Preparing' }, { status: 'READY', label: 'Ready for pickup' }]

  async function refreshOrders() {
    if (mode === 'demo') return
    setLoading(true)
    try {
      setApiOrders((await listKitchenOrders()).map(mapOrder))
      setError('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load kitchen orders.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (mode === 'demo') return
    let active = true
    const load = () => {
      void listKitchenOrders().then((result) => {
        if (!active) return
        setApiOrders(result.map(mapOrder))
        setError('')
        setLoading(false)
      }).catch((requestError: unknown) => {
        if (!active) return
        setError(requestError instanceof Error ? requestError.message : 'Could not load kitchen orders.')
        setLoading(false)
      })
    }
    const initialLoad = window.setTimeout(load, 0)
    const timer = window.setInterval(load, 12000)
    return () => { active = false; window.clearTimeout(initialLoad); window.clearInterval(timer) }
  }, [mode])

  async function advance(order: Order) {
    const next: 'PREPARING' | 'READY' = order.status === 'RECEIVED' ? 'PREPARING' : 'READY'
    if (mode === 'demo') {
      setOrders(demoOrders.map((entry) => entry.id === order.id ? { ...entry, status: next } : entry))
      notify(`${order.id} moved to ${next.toLowerCase()}.`)
      return
    }
    try {
      await updateKitchenOrder(order.backendId ?? order.id, next)
      notify(`${order.id} moved to ${next.toLowerCase()}.`)
      await refreshOrders()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update this order.')
    }
  }

  return <><PageHeading eyebrow="BACK OF HOUSE · KITCHEN DISPLAY" title="Kitchen board" description="A calm pass makes a better service. Keep every ticket moving." action={<span className="simulation-label"><span /> LIVE ORDER QUEUE</span>} />{error && <p role="alert" className="form-error">{error}</p>}<div className="kitchen-summary"><div><strong>{orders.filter((order) => ['RECEIVED', 'PREPARING'].includes(order.status)).length}</strong><span>active tickets</span></div><div><strong>{orders.filter((order) => order.status === 'READY').length}</strong><span>ready for pickup</span></div><div><strong>18<span> min</span></strong><span>average prep time</span></div><div className="kitchen-updated"><span className="online-dot" /> Last synced just now</div></div>{loading ? <div className="empty-state page-empty">Loading kitchen orders...</div> : <div className="kitchen-columns">{columns.map((column) => { const tickets = orders.filter((order) => order.status === column.status); return <section className="kitchen-column" key={column.status}><div className="kitchen-column-head"><div><span className={`column-dot ${column.status.toLowerCase()}`} /><h2>{column.label}</h2></div><span className="column-count">{String(tickets.length).padStart(2, '0')}</span></div><div className="ticket-stack">{tickets.map((order) => <article className={`ticket-card ticket-${order.status.toLowerCase()}`} key={order.id}><div className="ticket-head"><div><strong>{order.id}</strong><small>TABLE {String(order.table).padStart(2, '0')}</small></div><span><Clock3 size={13} /> {order.time}</span></div><div className="ticket-items">{order.items.map((item) => <div key={item.name}><b>{item.qty}</b><span>{item.name}</span></div>)}</div><div className="ticket-footer">{column.status !== 'READY' ? <button className="ticket-action" onClick={() => void advance(order)}>{column.status === 'RECEIVED' ? 'Start preparing' : 'Mark ready'} <ArrowRight size={14} /></button> : <span className="ready-confirm"><Check size={15} /> Waiting for pickup</span>}</div></article>)}{tickets.length === 0 && <div className="column-empty">Nothing here right now.<br />You’re all caught up.</div>}</div></section> })}</div>}</>
}

function CustomerApiDashboard() {
  const { notify } = useWorkspace()
  const [categories, setCategories] = useState<MenuCategoryDto[]>([])
  const [items, setItems] = useState<MenuItemDto[]>([])
  const [menuCache, setMenuCache] = useState<Record<string, MenuItemDto>>({})
  const [category, setCategory] = useState('All items')
  const [search, setSearch] = useState('')
  const [table, setTable] = useState('')
  const [cart, setCart] = useState<Record<string, number>>({})
  const { section, setSection } = useWorkspace()
  const showHistory = section === 'orders'
  const [history, setHistory] = useState<Order[]>([])
  const [lastOrder, setLastOrder] = useState<Order | null>(null)
  const [menuLoading, setMenuLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [error, setError] = useState('')
  const categoryId = categories.find((entry) => entry.name === category)?.id
  const cartCount = Object.values(cart).reduce((sum, amount) => sum + amount, 0)
  const cartItems = Object.keys(cart).map((id) => menuCache[id]).filter((item): item is MenuItemDto => Boolean(item))
  const total = cartItems.reduce((sum, item) => sum + item.price * (cart[item.id] ?? 0), 0)

  useEffect(() => {
    let active = true
    void listMenuCategories().then((result) => {
      if (active) setCategories(result)
    }).catch((requestError: unknown) => {
      if (active) setError(requestError instanceof Error ? requestError.message : 'Could not load menu categories.')
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    const timer = window.setTimeout(() => {
      void listMenuItems({ categoryId, query: search || undefined, page: 0, size: 100 }).then((result) => {
        if (!active) return
        setItems(result.content)
        setMenuCache((current) => ({ ...current, ...Object.fromEntries(result.content.map((item) => [item.id, item])) }))
        setMenuLoading(false)
        setError('')
      }).catch((requestError: unknown) => {
        if (!active) return
        setError(requestError instanceof Error ? requestError.message : 'Could not load menu items.')
        setMenuLoading(false)
      })
    }, 180)
    return () => { active = false; window.clearTimeout(timer) }
  }, [categoryId, search])

  useEffect(() => {
    if (!showHistory) return
    let active = true
    const load = () => {
      void listMyOrders().then((result) => {
        if (!active) return
        setHistory(result.content.map(mapOrder))
        setHistoryLoading(false)
        setError('')
      }).catch((requestError: unknown) => {
        if (!active) return
        setError(requestError instanceof Error ? requestError.message : 'Could not load order history.')
        setHistoryLoading(false)
      })
    }
    const initialLoad = window.setTimeout(load, 0)
    const timer = window.setInterval(load, 15000)
    return () => { active = false; window.clearTimeout(initialLoad); window.clearInterval(timer) }
  }, [showHistory])

  function adjust(id: string, amount: number) {
    setCart((current) => ({ ...current, [id]: Math.max(0, (current[id] ?? 0) + amount) }))
  }

  async function placeOrder() {
    if (!table || cartCount === 0) {
      notify(!table ? 'Choose a table number before placing your order.' : 'Add an item to your order first.')
      return
    }
    setPlacingOrder(true)
    setError('')
    try {
      const created = await createOrder({
        tableNumber: Number(table),
        items: Object.entries(cart).filter(([, quantity]) => quantity > 0).map(([menuItemId, quantity]) => ({ menuItemId, quantity })),
      })
      const placed = mapOrder(created)
      setLastOrder(placed)
      setHistory((current) => [placed, ...current])
      setCart({})
      notify(`${placed.id} was sent to the kitchen.`)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not place this order. Your cart is unchanged.')
    } finally {
      setPlacingOrder(false)
    }
  }

  const categoryNames = ['All items', ...categories.map((entry) => entry.name)]
  return <><PageHeading eyebrow="LINDEN HOUSE · YOUR TABLE" title={showHistory ? 'Your orders' : 'A seat at the table'} description={showHistory ? 'Follow the progress of your recent orders.' : 'A few good things, made fresh in our kitchen.'} action={<button className="button-secondary" onClick={() => { if (!showHistory) setHistoryLoading(true); setSection(showHistory ? 'menu' : 'orders') }}><ShoppingBag size={16} /> {showHistory ? 'Back to menu' : `My orders${history.length ? ` (${history.length})` : ''}`}</button>} />{error && <p role="alert" className="form-error">{error}</p>}{showHistory ? <section className="panel recent-orders customer-history"><div className="panel-header"><div><p className="eyebrow">ORDER HISTORY</p><h2>Recent orders</h2></div></div>{historyLoading ? <div className="empty-state">Loading your orders...</div> : <><OrderTable orders={history} />{history.length === 0 && <div className="empty-state"><ShoppingBag size={22} /><strong>No orders yet</strong><span>Once you order, progress will show here.</span></div>}</>}</section> : <div className="customer-layout"><section className="menu-browser"><div className="menu-filters"><div className="search-field menu-search"><Search size={16} /><input placeholder="Find something delicious" value={search} onChange={(event) => { setSearch(event.target.value); setMenuLoading(true) }} /></div><div className="category-pills">{categoryNames.map((item) => <button key={item} className={category === item ? 'category-pill selected' : 'category-pill'} onClick={() => { setCategory(item); setMenuLoading(true) }}>{item}</button>)}</div></div>{menuLoading ? <div className="empty-state page-empty">Loading menu...</div> : <div className="customer-menu-grid">{items.map((item) => <article className="menu-card" key={item.id}><div className="menu-photo" style={{ backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : undefined }}><span>{item.categoryName}</span></div><div className="menu-card-content"><div className="menu-card-title"><h2>{item.name}</h2><strong>${item.price.toFixed(2)}</strong></div><p>{item.description ?? ''}</p><div className="menu-card-bottom"><span>PREPARED FRESH</span>{cart[item.id] ? <QuantityControl value={cart[item.id]} onChange={(amount) => adjust(item.id, amount)} label={item.name} /> : <button className="add-item" aria-label={`Add ${item.name} to order`} onClick={() => adjust(item.id, 1)}><Plus size={16} /></button>}</div></div></article>)}</div>}{!menuLoading && items.length === 0 && <div className="empty-state page-empty"><Search size={22} /><strong>No dishes found</strong><span>Try a different search or category.</span></div>}</section><aside className="panel cart-panel"><div className="panel-header"><div><p className="eyebrow">YOUR ORDER</p><h2>Table service</h2></div><span className="cart-count">{cartCount}</span></div><label className="table-select">TABLE NUMBER<select value={table} onChange={(event) => setTable(event.target.value)}><option value="">Choose your table</option>{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>Table {String(index + 1).padStart(2, '0')}</option>)}</select><ChevronDown size={15} /></label><div className="cart-lines">{cartItems.map((item) => <div className="cart-line" key={item.id}><div><strong>{item.name}</strong><small>${item.price.toFixed(2)} each</small></div><QuantityControl value={cart[item.id]} onChange={(amount) => adjust(item.id, amount)} label={item.name} compact /></div>)}{cartCount === 0 && <div className="cart-empty"><Coffee size={20} /><span>Your order is empty.<br />Add something from the menu.</span></div>}</div><div className="cart-total"><span>Subtotal</span><strong>${total.toFixed(2)}</strong></div><button className="button-primary full-width" disabled={!cartCount || placingOrder} onClick={() => void placeOrder()}>{placingOrder ? 'Sending order...' : 'Place order'} <ArrowRight size={16} /></button>{lastOrder && <p className="cart-disclaimer">Last order {lastOrder.id}: ${lastOrder.total.toFixed(2)} · {lastOrder.status}</p>}<p className="cart-disclaimer">The server calculates the final total. No payment is collected here.</p></aside></div>}</>
}

function CustomerDashboard() {
  const { user } = useAuth(); const { orders, setOrders, notify } = useWorkspace()
  const { section, setSection } = useWorkspace()
  const [category, setCategory] = useState('All items'); const [search, setSearch] = useState(''); const [table, setTable] = useState(''); const [cart, setCart] = useState<Record<string, number>>({}); const showHistory = section === 'orders'
  const categories = ['All items', 'Starters', 'Mains', 'Drinks']; const filtered = menuItems.filter((item) => (category === 'All items' || item.category === category) && `${item.name} ${item.description}`.toLowerCase().includes(search.toLowerCase()))
  const cartCount = Object.values(cart).reduce((sum, amount) => sum + amount, 0); const total = menuItems.reduce((sum, item) => sum + item.price * (cart[item.id] ?? 0), 0); const mine = orders.filter((order) => order.guest === user?.displayName)
  function placeOrder() { if (!table || cartCount === 0) { notify(!table ? 'Choose a table number before placing your order.' : 'Add an item to your order first.'); return } const order: Order = { id: `ORD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, table: Number(table), guest: user?.displayName ?? 'Guest', status: 'RECEIVED', items: menuItems.filter((item) => cart[item.id]).map((item) => ({ name: item.name, qty: cart[item.id] })), total, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }; setOrders([order, ...orders]); setCart({}); notify('Your demo order has been sent to the kitchen.') }
  function adjust(id: string, amount: number) { setCart({ ...cart, [id]: Math.max(0, (cart[id] ?? 0) + amount) }) }
  return <><PageHeading eyebrow="LINDEN HOUSE · YOUR TABLE" title={showHistory ? 'Your orders' : 'A seat at the table'} description={showHistory ? 'Follow the progress of your recent orders.' : 'A few good things, made fresh in our kitchen.'} action={<button className="button-secondary" onClick={() => setSection(showHistory ? 'menu' : 'orders')}><ShoppingBag size={16} /> {showHistory ? 'Back to menu' : `My orders${mine.length ? ` (${mine.length})` : ''}`}</button>} />{showHistory ? <section className="panel recent-orders customer-history"><div className="panel-header"><div><p className="eyebrow">ORDER HISTORY</p><h2>Recent orders</h2></div></div><OrderTable orders={mine} />{mine.length === 0 && <div className="empty-state"><ShoppingBag size={22} /><strong>No orders yet</strong><span>Once you order, progress will show here.</span></div>}</section> : <div className="customer-layout"><section className="menu-browser"><div className="menu-filters"><div className="search-field menu-search"><Search size={16} /><input placeholder="Find something delicious" value={search} onChange={(event) => setSearch(event.target.value)} /></div><div className="category-pills">{categories.map((item) => <button key={item} className={category === item ? 'category-pill selected' : 'category-pill'} onClick={() => setCategory(item)}>{item}</button>)}</div></div><div className="customer-menu-grid">{filtered.map((item) => <article className="menu-card" key={item.id}><div className="menu-photo" style={{ backgroundImage: `url(https://images.unsplash.com/${item.image}?auto=format&fit=crop&w=720&q=82)` }}><span>{item.category}</span></div><div className="menu-card-content"><div className="menu-card-title"><h2>{item.name}</h2><strong>${item.price}</strong></div><p>{item.description}</p><div className="menu-card-bottom"><span>PREPARED FRESH</span>{cart[item.id] ? <QuantityControl value={cart[item.id]} onChange={(amount) => adjust(item.id, amount)} label={item.name} /> : <button className="add-item" aria-label={`Add ${item.name} to order`} onClick={() => adjust(item.id, 1)}><Plus size={16} /></button>}</div></div></article>)}</div>{filtered.length === 0 && <div className="empty-state page-empty"><Search size={22} /><strong>No dishes found</strong><span>Try a different search or category.</span></div>}</section><aside className="panel cart-panel"><div className="panel-header"><div><p className="eyebrow">YOUR ORDER</p><h2>Table service</h2></div><span className="cart-count">{cartCount}</span></div><label className="table-select">TABLE NUMBER<select value={table} onChange={(event) => setTable(event.target.value)}><option value="">Choose your table</option>{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>Table {String(index + 1).padStart(2, '0')}</option>)}</select><ChevronDown size={15} /></label><div className="cart-lines">{menuItems.filter((item) => cart[item.id]).map((item) => <div className="cart-line" key={item.id}><div><strong>{item.name}</strong><small>${item.price} each</small></div><QuantityControl value={cart[item.id]} onChange={(amount) => adjust(item.id, amount)} label={item.name} compact /></div>)}{cartCount === 0 && <div className="cart-empty"><Coffee size={20} /><span>Your order is empty.<br />Add something from the menu.</span></div>}</div><div className="cart-total"><span>Subtotal</span><strong>${total.toFixed(2)}</strong></div><button className="button-primary full-width" disabled={!cartCount} onClick={placeOrder}>Place demo order <ArrowRight size={16} /></button><p className="cart-disclaimer">No payment is collected in this demo.</p></aside></div>}</>
}
function QuantityControl({ value, onChange, label, compact = false }: { value: number; onChange: (amount: number) => void; label: string; compact?: boolean }) { return <div className={`quantity-control ${compact ? 'compact-quantity' : ''}`}><button aria-label={`Remove one ${label}`} onClick={() => onChange(-1)}><Minus size={13} /></button><strong>{value}</strong><button aria-label={`Add one ${label}`} onClick={() => onChange(1)}><Plus size={13} /></button></div> }

export default App