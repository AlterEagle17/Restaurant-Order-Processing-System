import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, NavLink, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Activity, ArrowDownRight, ArrowUpRight, ChefHat, CircleDollarSign, ClipboardList, Clock3, LogOut, Menu as MenuIcon, Plus, RefreshCw, ShoppingBag, Users, UtensilsCrossed, X } from 'lucide-react'
import api, { errorMessage } from './api'
import { useAuth } from './AuthContext'

const roles = {
  CUSTOMER: { title: 'Guest menu', links: [['/app', 'Menu', UtensilsCrossed], ['/app/orders', 'Your orders', ClipboardList]] },
  KITCHEN_STAFF: { title: 'Kitchen', links: [['/app', 'Order rail', ChefHat]] },
  WAITER: { title: 'Floor service', links: [['/app', 'Ready to serve', UtensilsCrossed]] },
  CASHIER: { title: 'Checkout', links: [['/app', 'Open bills', CircleDollarSign]] },
  MANAGER: { title: 'Overview', links: [['/app', 'Sales report', Activity]] },
  ADMIN: { title: 'Administration', links: [['/app', 'Overview', Activity], ['/app/users', 'Team access', Users], ['/app/menu-admin', 'Menu catalog', UtensilsCrossed]] },
}
const money = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount || 0))
const day = new Date().toISOString().slice(0, 10)

function Guard({ allowed }) {
  const { user, ready } = useAuth()
  if (!ready) return <div className="screen-loader"><span className="spinner" />Opening the house...</div>
  if (!user) return <Navigate to="/login" replace />
  if (allowed && !allowed.includes(user.role)) return <Navigate to="/denied" replace />
  return <Outlet />
}

function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  if (user) return <Navigate to="/app" replace />
  async function submit(event) {
    event.preventDefault(); setError(''); setBusy(true)
    try { await login(username, password); navigate('/app', { replace: true }) }
    catch (e) { setError(errorMessage(e)) }
    finally { setBusy(false) }
  }
  return <main className="login-page">
    <section className="login-art" aria-label="Restaurant dining room">
      <div className="brand-mark"><span className="brand-leaf">J</span><span>JUNIPER HOUSE<small>RESTAURANT OPERATIONS</small></span></div>
      <div className="art-copy"><span className="eyebrow">GOOD FOOD, GOOD FLOW</span><h1>Hospitality,<br />in its element.</h1><p>One calm place to keep every table, ticket, and team member in step.</p></div>
      <div className="art-caption"><span>01 / SERVICE IN MOTION</span><span>EST. 2014 · SEASONAL TABLE</span></div>
    </section>
    <section className="login-panel"><div className="login-top"><span className="mobile-brand">JUNIPER HOUSE</span><span className="open-indicator"><i /> HOUSE OPEN</span></div>
      <div className="login-form-wrap"><span className="eyebrow">STAFF PORTAL</span><h2>Welcome back.</h2><p className="muted">Sign in with the account your administrator created.</p>
        <form onSubmit={submit} className="form-stack">
          <label>Username or email<input autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} required placeholder="Your account name" /></label>
          <label>Password<input autoComplete="current-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter your password" /></label>
          {error && <div className="alert">{error}</div>}
          <button className="button button-primary button-wide" disabled={busy}>{busy ? <><span className="spinner small" /> Signing in</> : 'Sign in to Juniper House'}</button>
        </form>
        <p className="login-foot">Need access? Ask your restaurant administrator to create an account.</p>
      </div>
      <span className="panel-footer">SERVICE DESK <span>INTERNAL ACCESS ONLY</span></span>
    </section>
  </main>
}

function Shell() {
  const { user, logout } = useAuth()
  const nav = roles[user.role] || roles.CUSTOMER
  const [loggingOut, setLoggingOut] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  useEffect(() => setMobileOpen(false), [location.pathname])
  async function signOut() { setLoggingOut(true); await logout(); setLoggingOut(false) }
  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <Link className="sidebar-brand" to="/app"><span className="brand-leaf">J</span><span>JUNIPER<small>HOUSE · SERVICE DESK</small></span></Link>
      <div className="side-section-label">WORKSPACE</div>
      <nav>{nav.links.map(([path, label, Icon]) => <NavLink key={path} end={path === '/app'} to={path} className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}><Icon size={18} strokeWidth={1.8} /><span>{label}</span>{label === 'Open bills' && <b className="side-live" />}</NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="staff-avatar">{user.username.slice(0, 1).toUpperCase()}</div><div className="staff-label"><strong>{user.username}</strong><span>{user.role.replaceAll('_', ' ')}</span></div><button className="icon-button signout" aria-label="Sign out" title="Sign out" onClick={signOut} disabled={loggingOut}><LogOut size={17} /></button></div>
    </aside>
    <div className="main-column"><header className="topbar"><button className="icon-button mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation">{mobileOpen ? <X size={20} /> : <MenuIcon size={20} />}</button><div className="breadcrumbs"><span>JUNIPER HOUSE</span><b>/</b><strong>{nav.title}</strong></div><div className="topbar-right"><span className="service-date"><i /> SERVICE LIVE</span><span className="top-user">{user.username}</span></div></header><main className="workspace"><Outlet /></main><footer className="app-footer"><span>JUNIPER HOUSE · OPERATIONS</span><span>GOOD SERVICE IS A TEAM SPORT</span></footer></div>
    {mobileOpen && <button className="scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
  </div>
}

function PageHeading({ eyebrow, title, description, action }) {
  return <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div>
}
function Notice({ error, onRetry }) { return error ? <div className="alert notice">{error}{onRetry && <button className="text-button" onClick={onRetry}>Try again</button>}</div> : null }
function Empty({ icon: Icon = ClipboardList, title, copy }) { return <div className="empty-state"><span><Icon size={22} /></span><strong>{title}</strong><p>{copy}</p></div> }
function Status({ value }) { return <span className={`status status-${value.toLowerCase()}`}><i />{value}</span> }
function useLoad(url) {
  const [data, setData] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('')
  async function refresh() { setLoading(true); setError(''); try { const { data: result } = await api.get(url); setData(result) } catch (e) { setError(errorMessage(e)) } finally { setLoading(false) } }
  useEffect(() => { refresh() }, [url])
  return { data, setData, loading, error, refresh }
}

function CustomerPage({ cart, setCart }) {
  const location = useLocation()
  const [tab, setTab] = useState(location.pathname.endsWith('/orders') ? 'orders' : 'menu')
  useEffect(() => setTab(location.pathname.endsWith('/orders') ? 'orders' : 'menu'), [location.pathname])
  const [category, setCategory] = useState('All plates')
  const [tableNumber, setTableNumber] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const menu = useLoad('/menu')
  const orders = useLoad('/orders')
  const categories = useMemo(() => ['All plates', ...new Set(menu.data.map(item => item.category?.name).filter(Boolean))], [menu.data])
  const filtered = category === 'All plates' ? menu.data : menu.data.filter(item => item.category?.name === category)
  function add(item, delta = 1) { setCart(current => { const count = (current[item.id]?.quantity || 0) + delta; const next = { ...current }; if (count <= 0) delete next[item.id]; else next[item.id] = { item, quantity: count }; return next }) }
  const total = Object.values(cart).reduce((sum, line) => sum + Number(line.item.price) * line.quantity, 0)
  async function placeOrder() {
    if (!tableNumber || !Object.keys(cart).length) { setNotice('Choose your table and add something from the menu.'); return }
    setBusy(true); setNotice('')
    try { await api.post('/orders', { tableNumber: Number(tableNumber), items: Object.values(cart).map(({ item, quantity }) => ({ menuItemId: item.id, quantity })) }); setCart({}); setTableNumber(''); setNotice('Order sent to the kitchen.'); orders.refresh() }
    catch (e) { setNotice(errorMessage(e)) } finally { setBusy(false) }
  }
  return <>
    <PageHeading eyebrow="AT THE TABLE" title={tab === 'menu' ? 'A seat at the table.' : 'Your orders'} description={tab === 'menu' ? 'Thoughtful plates, prepared fresh. Add a few favorites to get started.' : 'Follow each order from the kitchen pass to your table.'}
      action={<button className={`button ${tab === 'orders' ? 'button-outline' : 'button-dark'}`} onClick={() => setTab(tab === 'menu' ? 'orders' : 'menu')}><ClipboardList size={16} />{tab === 'menu' ? 'Order history' : 'Back to menu'}</button>} />
    {tab === 'orders' ? <><Notice error={orders.error} onRetry={orders.refresh} />{orders.loading ? <Loader /> : orders.data.length ? <div className="order-list">{orders.data.map(order => <OrderCard key={order.id} order={order} />)}</div> : <Empty title="Nothing on the pass yet" copy="Your recent orders will show here." />}</> : <>
      <div className="customer-toolbar"><div className="category-tabs">{categories.map(name => <button key={name} className={category === name ? 'selected' : ''} onClick={() => setCategory(name)}>{name}</button>)}</div><span className="menu-count">{filtered.length} PLATES</span></div>
      <Notice error={menu.error || notice} onRetry={menu.refresh} />{menu.loading ? <Loader /> : <div className="menu-grid">{filtered.map(item => <article className="menu-card" key={item.id}><div className="menu-photo"><img src={item.imageUrl} alt={item.name} loading="lazy" /><span>{item.category?.name}</span></div><div className="menu-card-body"><h3>{item.name}</h3><p>{item.description}</p><div className="menu-card-bottom"><strong>{money(item.price)}</strong><button className="add-button" onClick={() => add(item)} aria-label={`Add ${item.name}`}><Plus size={17} /> Add</button></div></div></article>)}</div>}
      <section className="order-builder"><div className="builder-heading"><div><span className="eyebrow">YOUR ORDER</span><h2>At your table</h2></div><span className="basket-count">{Object.values(cart).reduce((sum, line) => sum + line.quantity, 0)} ITEMS</span></div>
        {Object.values(cart).length ? <div className="cart-lines">{Object.values(cart).map(({ item, quantity }) => <div className="cart-line" key={item.id}><span>{item.name}<small>{money(item.price)} each</small></span><div className="quantity-control"><button onClick={() => add(item, -1)} aria-label={`Remove one ${item.name}`}>−</button><b>{quantity}</b><button onClick={() => add(item)} aria-label={`Add one ${item.name}`}>+</button></div><strong>{money(item.price * quantity)}</strong></div>)}</div> : <p className="muted compact">Your basket is waiting for a first plate.</p>}
        <div className="builder-footer"><label>TABLE NUMBER<input type="number" min="1" max="500" value={tableNumber} onChange={e => setTableNumber(e.target.value)} placeholder="e.g. 12" /></label><div className="builder-total"><span>ESTIMATED TOTAL</span><strong>{money(total)}</strong></div><button className="button button-primary" onClick={placeOrder} disabled={busy || !Object.keys(cart).length}>{busy ? 'Sending...' : 'Send to kitchen'}<ArrowUpRight size={16} /></button></div>
      </section>
    </>}
  </>
}

function OrderCard({ order, action }) {
  return <article className="order-card"><div className="order-card-top"><div><span className="order-number">ORDER #{String(order.id).padStart(4, '0')}</span><span className="order-table">TABLE {order.tableNumber}</span></div><Status value={order.status} /></div><div className="order-items">{order.items.map((line, index) => <div key={`${line.menuItemId}-${index}`}><span><b>{line.quantity}×</b> {line.name}</span><small>{money(line.unitPrice * line.quantity)}</small></div>)}</div><div className="order-card-bottom"><span>{new Date(order.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span><strong>{money(order.total)}</strong></div>{action}</article>
}
function Loader() { return <div className="loading-line"><span className="spinner" />Loading the latest service...</div> }

function KitchenPage() {
  const queue = useLoad('/orders'); const [message, setMessage] = useState('')
  async function update(id, status) { setMessage(''); try { await api.patch(`/orders/${id}/status`, { status }); await queue.refresh() } catch (e) { setMessage(errorMessage(e)) } }
  const active = queue.data.filter(order => ['PENDING', 'PREPARING'].includes(order.status))
  const ready = queue.data.filter(order => order.status === 'READY')
  return <><PageHeading eyebrow="KITCHEN PASS" title="The order rail." description="Every ticket, moving at the right pace." action={<button className="button button-outline" onClick={queue.refresh}><RefreshCw size={15} /> Refresh</button>} /><Notice error={queue.error || message} onRetry={queue.refresh} />
    <div className="metrics-row"><Metric label="IN PROGRESS" value={active.length} note="tickets at the pass" icon={ChefHat} /><Metric label="READY FOR FLOOR" value={ready.length} note="awaiting handover" icon={Clock3} /></div>
    {queue.loading ? <Loader /> : queue.data.length ? <div className="work-columns"><section><div className="section-heading"><h2>On the line</h2><span>{active.length} ACTIVE</span></div>{active.length ? active.map(order => <OrderCard key={order.id} order={order} action={<button className="button button-primary card-action" onClick={() => update(order.id, order.status === 'PENDING' ? 'PREPARING' : 'READY')}>{order.status === 'PENDING' ? 'Start preparing' : 'Mark ready'}<ArrowUpRight size={15} /></button>} />) : <Empty title="The line is clear" copy="New tickets appear here as they arrive." />}</section>
      <section><div className="section-heading"><h2>Ready for handover</h2><span>{ready.length} READY</span></div>{ready.length ? ready.map(order => <OrderCard key={order.id} order={order} />) : <Empty title="Nothing on the pass" copy="Completed plates will wait here for the floor team." />}</section></div> : <Empty title="No incoming tickets" copy="New customer orders will appear here." />}
  </>
}
function WaiterPage() {
  const queue = useLoad('/orders'); const [error, setError] = useState('')
  const ready = queue.data.filter(order => order.status === 'READY')
  async function markServed(id) { try { await api.patch(`/orders/${id}/status`, { status: 'SERVED' }); await queue.refresh() } catch (e) { setError(errorMessage(e)) } }
  return <><PageHeading eyebrow="FLOOR HANDOFF" title="Ready for the table." description="Plates are up. Confirm when each order reaches its table." action={<button className="button button-outline" onClick={queue.refresh}><RefreshCw size={15} /> Refresh</button>} /><Notice error={queue.error || error} onRetry={queue.refresh} /><div className="metrics-row"><Metric label="PLATES READY" value={ready.length} note="orders awaiting service" icon={UtensilsCrossed} /></div>
    {queue.loading ? <Loader /> : ready.length ? <div className="order-grid">{ready.map(order => <OrderCard key={order.id} order={order} action={<button className="button button-dark card-action" onClick={() => markServed(order.id)}>Mark served <ArrowUpRight size={15} /></button>} />)}</div> : <Empty title="All caught up" copy="Ready orders will appear here as soon as the kitchen calls them." />}</>
}

function CashierPage() {
  const queue = useLoad('/orders'); const [payments, setPayments] = useState([]); const [error, setError] = useState('')
  const served = queue.data.filter(order => order.status === 'SERVED')
  async function loadPayments() { try { const { data } = await api.get('/payments', { params: { from: day, to: day } }); setPayments(data) } catch (e) { setError(errorMessage(e)) } }
  useEffect(() => { loadPayments() }, [])
  async function takePayment(id, method) { try { await api.post(`/orders/${id}/payments`, { method }); await Promise.all([queue.refresh(), loadPayments()]) } catch (e) { setError(errorMessage(e)) } }
  return <><PageHeading eyebrow="CHECKOUT" title="Settle the table." description="Served orders, itemized and ready for payment." action={<button className="button button-outline" onClick={() => { queue.refresh(); loadPayments() }}><RefreshCw size={15} /> Refresh</button>} /><Notice error={queue.error || error} onRetry={queue.refresh} />
    <div className="metrics-row"><Metric label="AWAITING PAYMENT" value={served.length} note="served orders" icon={CircleDollarSign} /><Metric label="COLLECTED TODAY" value={money(payments.reduce((sum, p) => sum + Number(p.amount), 0))} note={`${payments.length} completed payments`} icon={ArrowUpRight} /></div>
    <div className="section-heading"><h2>Open bills</h2><span>{served.length} TO SETTLE</span></div>
    {queue.loading ? <Loader /> : served.length ? <div className="order-grid">{served.map(order => <Bill key={order.id} order={order} onPay={takePayment} />)}</div> : <Empty title="No open bills" copy="Served orders will be ready for settlement here." />}
    <div className="section-heading payments-heading"><h2>Payments today</h2><span>{payments.length} COMPLETE</span></div>{payments.length > 0 && <div className="table-wrap"><table><thead><tr><th>PAYMENT</th><th>ORDER</th><th>METHOD</th><th>PAID AT</th><th className="align-right">TOTAL</th></tr></thead><tbody>{payments.map(p => <tr key={p.id}><td>#{p.id}</td><td>#{p.orderId}</td><td>{p.method.replaceAll('_', ' ')}</td><td>{new Date(p.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td><td className="align-right">{money(p.amount)}</td></tr>)}</tbody></table></div>}
  </>
}
function Bill({ order, onPay }) {
  const [method, setMethod] = useState('CARD')
  return <article className="order-card bill-card"><div className="order-card-top"><div><span className="order-number">BILL #{String(order.id).padStart(4, '0')}</span><span className="order-table">TABLE {order.tableNumber}</span></div><span className="due-label">DUE</span></div><div className="order-items">{order.items.map((line, i) => <div key={i}><span><b>{line.quantity}×</b> {line.name}</span><small>{money(line.unitPrice * line.quantity)}</small></div>)}</div><div className="bill-total"><span>AMOUNT DUE</span><strong>{money(order.total)}</strong></div><div className="bill-pay-row"><select aria-label="Payment method" value={method} onChange={e => setMethod(e.target.value)}><option value="CARD">Card</option><option value="CASH">Cash</option><option value="DIGITAL_WALLET">Digital wallet</option></select><button className="button button-primary" onClick={() => onPay(order.id, method)}>Record payment <CircleDollarSign size={15} /></button></div></article>
}

function ManagerPage() {
  const [from, setFrom] = useState(day); const [to, setTo] = useState(day); const [report, setReport] = useState(null); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  const chartBars = useMemo(() => {
    const totals = new Map()
    for (const payment of report?.payments || []) {
      const date = payment.paidAt.slice(0, 10)
      totals.set(date, (totals.get(date) || 0) + Number(payment.amount))
    }
    const entries = [...totals.entries()].sort(([left], [right]) => left.localeCompare(right)).slice(-7)
    const maximum = Math.max(1, ...entries.map(([, amount]) => amount))
    return entries.map(([date, amount]) => ({ date, amount, height: Math.max(8, Math.round(amount / maximum * 100)) }))
  }, [report])
  async function load() { setBusy(true); setError(''); try { const { data } = await api.get('/reports/sales', { params: { from, to } }); setReport(data) } catch (e) { setError(errorMessage(e)) } finally { setBusy(false) } }
  useEffect(() => { load() }, [])
  return <><PageHeading eyebrow="BUSINESS PULSE" title="The house, at a glance." description="Revenue is calculated from completed payments only." action={<button className="button button-outline" onClick={load}><RefreshCw size={15} /> Refresh report</button>} /><div className="report-filters"><label>FROM<input type="date" value={from} onChange={e => setFrom(e.target.value)} /></label><span>TO</span><label>TO<input type="date" value={to} onChange={e => setTo(e.target.value)} /></label><button className="button button-dark" onClick={load} disabled={busy}>{busy ? 'Loading...' : 'Run report'}<ArrowUpRight size={15} /></button></div><Notice error={error} />
    <div className="metrics-row manager-metrics"><Metric label="NET REVENUE" value={money(report?.revenue)} note="from completed payments" icon={CircleDollarSign} positive /><Metric label="ORDERS PLACED" value={report?.orderCount ?? '—'} note="within selected period" icon={ShoppingBag} /><Metric label="PAYMENTS TAKEN" value={report?.payments?.length ?? '—'} note="completed transactions" icon={Activity} /></div>
    {busy ? <Loader /> : <><section className="report-band"><div className="report-copy"><span className="eyebrow">SALES SNAPSHOT</span><h2>{from === to ? new Date(`${from}T12:00:00`).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }) : `${from} — ${to}`}</h2><p>Every amount below reconciles against a recorded payment.</p></div><div className="report-number"><small>TOTAL COLLECTED</small><strong>{money(report?.revenue)}</strong><span><ArrowUpRight size={14} /> {report?.payments?.length || 0} paid bills</span></div><div className="report-bars" aria-label="Daily payment summary">{chartBars.map(bar => <i key={bar.date} title={`${bar.date}: ${money(bar.amount)}`} style={{ height: `${bar.height}%` }} />)}</div></section>
      <div className="section-heading"><h2>Recent payments</h2><span>{report?.payments?.length || 0} IN PERIOD</span></div>{report?.payments?.length ? <div className="table-wrap"><table><thead><tr><th>ORDER</th><th>METHOD</th><th>DATE & TIME</th><th>STATUS</th><th className="align-right">AMOUNT</th></tr></thead><tbody>{report.payments.map(p => <tr key={p.id}><td>#{p.orderId}</td><td>{p.method.replaceAll('_', ' ')}</td><td>{new Date(p.paidAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</td><td><Status value={p.status} /></td><td className="align-right">{money(p.amount)}</td></tr>)}</tbody></table></div> : <Empty title="No completed payments in this period" copy="Try widening the date range to review earlier service." />}</>}
  </>
}

function Metric({ label, value, note, icon: Icon, positive }) {
  return <article className="metric-card"><div className="metric-top"><span>{label}</span><Icon size={17} /></div><strong>{value}</strong><div className="metric-note">{positive && <ArrowUpRight size={13} />}{note}</div></article>
}

function AdminPage() {
  const users = useLoad('/admin/users'); const menu = useLoad('/menu'); const orders = useLoad('/orders')
  const [view, setView] = useState('overview')
  return view === 'users' ? <UsersAdmin back={() => setView('overview')} /> : view === 'menu' ? <MenuAdmin back={() => setView('overview')} /> : <>
    <PageHeading eyebrow="HOUSE CONTROL" title="A well-run room." description="People, plates, and service activity at a glance." action={<button className="button button-outline" onClick={() => { users.refresh(); menu.refresh(); orders.refresh() }}><RefreshCw size={15} /> Refresh</button>} />
    <div className="metrics-row admin-metrics"><Metric label="TEAM ACCOUNTS" value={users.data.length || '—'} note="all assigned roles" icon={Users} /><Metric label="MENU PLATES" value={menu.data.length || '—'} note="available and paused" icon={UtensilsCrossed} /><Metric label="ORDERS TODAY" value={orders.data.filter(o => o.createdAt?.slice(0,10) === day).length || 0} note="current service" icon={ClipboardList} /></div>
    <section className="admin-actions"><div className="section-heading"><h2>Manage the house</h2><span>ADMINISTRATOR ACCESS</span></div><div className="admin-action-grid"><button onClick={() => setView('users')}><span className="action-icon"><Users size={20} /></span><span><strong>Team access</strong><small>Create accounts, assign roles and update access.</small></span><ArrowUpRight size={17} /></button><button onClick={() => setView('menu')}><span className="action-icon coral"><UtensilsCrossed size={20} /></span><span><strong>Menu catalog</strong><small>Keep categories, prices and availability current.</small></span><ArrowUpRight size={17} /></button></div></section>
    <Notice error={users.error || menu.error || orders.error} />
  </>
}

const roleOptions = ['CUSTOMER', 'KITCHEN_STAFF', 'WAITER', 'CASHIER', 'MANAGER', 'ADMIN']
function UsersAdmin({ back }) {
  const navigate = useNavigate()
  back = back || (() => navigate('/app'))
  const load = useLoad('/admin/users'); const [form, setForm] = useState({ username: '', email: '', password: '', role: 'CUSTOMER' }); const [editing, setEditing] = useState(null); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  function startEdit(user) { setEditing(user.id); setForm({ username: user.username, email: user.email, password: '', role: user.role, active: user.active }) }
  function reset() { setEditing(null); setForm({ username: '', email: '', password: '', role: 'CUSTOMER' }) }
  async function save(e) { e.preventDefault(); setBusy(true); setError(''); try { const data = { ...form, ...(editing && !form.password ? { password: null } : {}) }; if (editing) await api.put(`/admin/users/${editing}`, data); else await api.post('/admin/users', data); reset(); await load.refresh() } catch (err) { setError(errorMessage(err)) } finally { setBusy(false) } }
  return <><PageHeading eyebrow="TEAM ACCESS" title="The people behind service." description="Accounts are created by an administrator. There is no public registration." action={<button className="button button-outline" onClick={back}>← Overview</button>} />
    <div className="admin-layout"><form className="management-form" onSubmit={save}><span className="eyebrow">{editing ? 'EDIT ACCOUNT' : 'NEW ACCOUNT'}</span><h2>{editing ? 'Update teammate' : 'Invite a teammate'}</h2><label>USERNAME<input required minLength="3" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} /></label><label>EMAIL<input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label><label>{editing ? 'NEW PASSWORD (OPTIONAL)' : 'TEMPORARY PASSWORD'}<input type="password" minLength="12" required={!editing} autoComplete="new-password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="At least 12 characters" /></label><label>ROLE<select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>{roleOptions.map(role => <option key={role}>{role}</option>)}</select></label>{editing && <label className="toggle-line"><input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} /> Account active</label>}<Notice error={error} /><button className="button button-primary button-wide" disabled={busy}>{busy ? 'Saving...' : editing ? 'Save account changes' : 'Create account'}</button>{editing && <button className="button button-quiet button-wide" type="button" onClick={reset}>Cancel edit</button>}</form>
      <section><div className="section-heading"><h2>All accounts</h2><span>{load.data.length} TEAM MEMBERS</span></div><Notice error={load.error} onRetry={load.refresh} />{load.loading ? <Loader /> : <div className="table-wrap"><table><thead><tr><th>NAME</th><th>ROLE</th><th>ACCESS</th><th></th></tr></thead><tbody>{load.data.map(user => <tr key={user.id}><td><strong>{user.username}</strong><small className="cell-sub">{user.email}</small></td><td>{user.role.replaceAll('_', ' ')}</td><td><span className={`status ${user.active ? 'status-paid' : 'status-cancelled'}`}><i />{user.active ? 'Active' : 'Inactive'}</span></td><td><button className="text-button" onClick={() => startEdit(user)}>Edit</button></td></tr>)}</tbody></table></div>}</section></div>
  </>
}

function MenuAdmin({ back }) {
  const navigate = useNavigate()
  back = back || (() => navigate('/app'))
  const menu = useLoad('/menu'); const categories = useLoad('/categories'); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  const blank = { name: '', description: '', imageUrl: '', price: '', categoryId: '', available: true }
  const [form, setForm] = useState(blank); const [editing, setEditing] = useState(null); const [categoryName, setCategoryName] = useState('')
  useEffect(() => { if (!form.categoryId && categories.data.length) setForm(current => ({ ...current, categoryId: String(categories.data[0].id) })) }, [categories.data])
  function edit(item) { setEditing(item.id); setForm({ name: item.name, description: item.description, imageUrl: item.imageUrl || '', price: item.price, categoryId: String(item.category.id), available: item.available }) }
  async function save(e) { e.preventDefault(); setBusy(true); setError(''); try { const payload = { ...form, price: Number(form.price), categoryId: Number(form.categoryId) }; if (editing) await api.put(`/admin/menu/${editing}`, payload); else await api.post('/admin/menu', payload); setForm(blank); setEditing(null); await menu.refresh() } catch (err) { setError(errorMessage(err)) } finally { setBusy(false) } }
  async function addCategory(e) { e.preventDefault(); try { await api.post('/admin/categories', { name: categoryName, description: '' }); setCategoryName(''); await categories.refresh() } catch (err) { setError(errorMessage(err)) } }
  async function setAvailability(item) {
    try { await api.delete(`/admin/menu/${item.id}`); await menu.refresh() } catch (err) { setError(errorMessage(err)) }
  }
  return <><PageHeading eyebrow="MENU CATALOG" title="The menu, in good order." description="Prices and availability update directly on the guest menu." action={<button className="button button-outline" onClick={back}>← Overview</button>} />
    <div className="category-manage"><form onSubmit={addCategory}><label>ADD A CATEGORY<input value={categoryName} required maxLength="80" onChange={e => setCategoryName(e.target.value)} placeholder="e.g. From the garden" /></label><button className="button button-dark"><Plus size={15} /> Add category</button></form><div className="category-chips">{categories.data.map(category => <span key={category.id}>{category.name}</span>)}</div></div>
    <div className="admin-layout menu-admin-layout"><form className="management-form" onSubmit={save}><span className="eyebrow">{editing ? 'EDIT PLATE' : 'ADD A PLATE'}</span><h2>{editing ? 'Update menu item' : 'New menu item'}</h2><label>NAME<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label><label>DESCRIPTION<textarea required rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label><label>IMAGE URL<input type="url" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} /></label><div className="form-inline"><label>PRICE<input type="number" min="0.01" step="0.01" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></label><label>CATEGORY<select required value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>{categories.data.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label></div><label className="toggle-line"><input type="checkbox" checked={form.available} onChange={e => setForm({ ...form, available: e.target.checked })} /> Available on guest menu</label><Notice error={error} /><button className="button button-primary button-wide" disabled={busy || !categories.data.length}>{busy ? 'Saving...' : editing ? 'Save menu item' : 'Add to menu'}</button>{editing && <button type="button" className="button button-quiet button-wide" onClick={() => { setEditing(null); setForm(blank) }}>Cancel edit</button>}</form>
      <section><div className="section-heading"><h2>Current menu</h2><span>{menu.data.length} PLATES</span></div><Notice error={menu.error} onRetry={menu.refresh} />{menu.loading ? <Loader /> : <div className="table-wrap"><table><thead><tr><th>PLATE</th><th>CATEGORY</th><th>PRICE</th><th>AVAILABILITY</th><th></th></tr></thead><tbody>{menu.data.map(item => <tr key={item.id}><td><strong>{item.name}</strong><small className="cell-sub">{item.description}</small></td><td>{item.category.name}</td><td>{money(item.price)}</td><td><span className={`status ${item.available ? 'status-paid' : 'status-cancelled'}`}><i />{item.available ? 'Available' : 'Paused'}</span></td><td><button className="text-button" onClick={() => edit(item)}>Edit</button><button className="text-button" onClick={() => setAvailability(item)}>{item.available ? 'Pause' : 'Remove'}</button></td></tr>)}</tbody></table></div>}</section></div>
  </>
}

function RoleHome({ cart, setCart }) {
  const { user } = useAuth()
  if (user.role === 'CUSTOMER') return <CustomerPage cart={cart} setCart={setCart} />
  if (user.role === 'KITCHEN_STAFF') return <KitchenPage />
  if (user.role === 'WAITER') return <WaiterPage />
  if (user.role === 'CASHIER') return <CashierPage />
  if (user.role === 'MANAGER') return <ManagerPage />
  return <AdminPage />
}
function Denied() { return <main className="denied"><span className="eyebrow">403 · ACCESS RESTRICTED</span><h1>This room is for another role.</h1><p>Your account does not have access to this workspace.</p><Link to="/app" className="button button-dark">Return to your dashboard</Link></main> }
function App() {
  const [cart, setCart] = useState({})
  return <Routes><Route path="/login" element={<Login />} /><Route path="/denied" element={<Denied />} /><Route element={<Guard />}><Route path="/app" element={<Shell />}><Route index element={<RoleHome cart={cart} setCart={setCart} />} />
      <Route path="orders" element={<Guard allowed={['CUSTOMER']} />}><Route index element={<CustomerPage cart={cart} setCart={setCart} />} /></Route>
      <Route path="users" element={<Guard allowed={['ADMIN']} />}><Route index element={<UsersAdmin />} /></Route>
      <Route path="menu-admin" element={<Guard allowed={['ADMIN']} />}><Route index element={<MenuAdmin />} /></Route>
    </Route></Route><Route path="*" element={<Navigate to="/app" replace />} /></Routes>
}
export default App