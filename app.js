const app = (function() {
  
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const state = {
    currentUser: null,
    location: 'All',
    activeView: 'home',
    bookings: [],
    wishlist: [],
    cart: null, // Holds item currently being booked
    globalSeats: {} // Holds all booked seats across all users
  };

  // ==========================================
  // MOCK DATABASE
  // ==========================================
  const db = {
    movies: [
      { id: 'm1', title: 'Dune: Part Two', image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=400', price: 350, location: 'Mumbai', time: '18:30', category: 'movies' },
      { id: 'm2', title: 'Oppenheimer', image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=400', price: 400, location: 'Delhi', time: '20:00', category: 'movies' },
      { id: 'm3', title: 'Salaar', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=400', price: 250, location: 'Hyderabad', time: '14:15', category: 'movies' },
      { id: 'm4', title: 'Deadpool & Wolverine', image: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=400', price: 450, location: 'All', time: '21:00', category: 'movies' }
    ],
    flights: [
      { id: 'f1', title: 'Mumbai to Dubai (Emirates)', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=400', price: 15000, location: 'Mumbai', time: '09:00 AM', category: 'flights' },
      { id: 'f2', title: 'Delhi to London (Air India)', image: 'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?auto=format&fit=crop&q=80&w=400', price: 45000, location: 'Delhi', time: '11:30 PM', category: 'flights' },
      { id: 'f3', title: 'Bangalore to Singapore (IndiGo)', image: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&q=80&w=400', price: 12000, location: 'Bangalore', time: '06:15 AM', category: 'flights' }
    ],
    trains: [
      { id: 't1', title: 'Vande Bharat Express (Mumbai - Goa)', image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400', price: 1800, location: 'Mumbai', time: '05:45 AM', category: 'trains' },
      { id: 't2', title: 'Rajdhani Express (Delhi - Mumbai)', image: 'https://images.unsplash.com/photo-1541427468627-a89a96e5ca1d?auto=format&fit=crop&q=80&w=400', price: 3200, location: 'Delhi', time: '16:00 PM', category: 'trains' }
    ],
    buses: [
      { id: 'b1', title: 'Zingbus AC Sleeper (Hyd - Blr)', image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=400', price: 1200, location: 'Hyderabad', time: '22:00 PM', category: 'buses' },
      { id: 'b2', title: 'IntrCity SmartBus (Pune - Mum)', image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=400', price: 600, location: 'Pune', time: '08:00 AM', category: 'buses' }
    ],
    hotels: [
      { id: 'h1', title: 'Taj Mahal Palace', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=400', price: 25000, location: 'Mumbai', time: 'Check-in 14:00', category: 'hotels' },
      { id: 'h2', title: 'ITC Maurya', image: 'https://images.unsplash.com/photo-1551882547-ff40c0d5e9af?auto=format&fit=crop&q=80&w=400', price: 18000, location: 'Delhi', time: 'Check-in 12:00', category: 'hotels' }
    ],
    sports: [
      { id: 's1', title: 'IPL Final: MI vs CSK', image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=400', price: 2500, location: 'Mumbai', time: '19:30', category: 'sports' },
      { id: 's2', title: 'India vs Pakistan (T20)', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=400', price: 5000, location: 'All', time: '14:00', category: 'sports' }
    ]
  };

  // Temporary Seat state for current booking
  let selectedSeats = [];
  let currentSeatPrice = 0;

  // ==========================================
  // INITIALIZATION
  // ==========================================
  function init() {
    // Load state from localStorage
    const storedUser = localStorage.getItem('eventVerse_user');
    state.globalSeats = JSON.parse(localStorage.getItem('eventVerse_global_seats') || '{}');
    
    if (storedUser) {
      state.currentUser = JSON.parse(storedUser);
      state.bookings = JSON.parse(localStorage.getItem(`eventVerse_bookings_${state.currentUser.email}`) || '[]');
      state.wishlist = JSON.parse(localStorage.getItem(`eventVerse_wishlist_${state.currentUser.email}`) || '[]');
      updateUIForUser();
    }
    
    // Initial Render
    renderTrending();
    
    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if(e.target === modal) modal.classList.add('hidden');
      });
    });
  }

  // ==========================================
  // UTILITIES
  // ==========================================
  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
  }

  // ==========================================
  // AUTHENTICATION
  // ==========================================
  function switchAuthTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.tab-btn[onclick="app.switchAuthTab('${tab}')"]`).classList.add('active');
    
    if (tab === 'login') {
      document.getElementById('loginForm').classList.remove('hidden');
      document.getElementById('signupForm').classList.add('hidden');
    } else {
      document.getElementById('loginForm').classList.add('hidden');
      document.getElementById('signupForm').classList.remove('hidden');
    }
  }

  function handleAuth(e, type) {
    e.preventDefault();
    let user = {};
    
    if (type === 'login') {
      const email = document.getElementById('loginEmail').value;
      user = { name: email.split('@')[0], email: email };
    } else {
      const name = document.getElementById('signupName').value;
      const email = document.getElementById('signupEmail').value;
      user = { name, email };
    }

    state.currentUser = user;
    localStorage.setItem('eventVerse_user', JSON.stringify(user));
    
    // Load user specific data
    state.bookings = JSON.parse(localStorage.getItem(`eventVerse_bookings_${user.email}`) || '[]');
    state.wishlist = JSON.parse(localStorage.getItem(`eventVerse_wishlist_${user.email}`) || '[]');
    
    updateUIForUser();
    closeModal('authModal');
    showToast(`Welcome back, ${user.name}!`);
  }

  function logout() {
    state.currentUser = null;
    state.bookings = [];
    state.wishlist = [];
    localStorage.removeItem('eventVerse_user');
    updateUIForUser();
    navigate('home');
    showToast('Logged out successfully.');
  }

  function updateUIForUser() {
    const profileEl = document.getElementById('userProfile');
    const actionsEl = document.getElementById('topbarActions');
    const navDashboard = document.getElementById('navDashboard');
    
    if (state.currentUser) {
      profileEl.classList.remove('hidden');
      document.getElementById('userNameDisplay').textContent = state.currentUser.name;
      actionsEl.innerHTML = ''; // Hide login button
      if(navDashboard) navDashboard.classList.remove('hidden');
      navigate('dashboard');
    } else {
      profileEl.classList.add('hidden');
      if(navDashboard) navDashboard.classList.add('hidden');
      actionsEl.innerHTML = `<button class="btn btn-outline btn-sm" onclick="app.openModal('authModal')">Login / Sign Up</button>`;
    }
  }

  // ==========================================
  // NAVIGATION & VIEWS
  // ==========================================
  function navigate(viewName) {
    state.activeView = viewName;
    
    // Update Sidebar
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const activeLink = document.querySelector(`.nav-item[data-target="${viewName}"]`);
    if(activeLink) activeLink.classList.add('active');

    // Hide all views
    document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));

    if (viewName === 'home') {
      document.getElementById('view-home').classList.add('active');
    } else if (viewName === 'dashboard') {
      if(!requireLogin()) return;
      document.getElementById('view-dashboard').classList.add('active');
      renderDashboard();
    } else if (viewName === 'wishlist') {
      if(!requireLogin()) return;
      document.getElementById('view-wishlist').classList.add('active');
      renderWishlist();
    } else if (viewName === 'bookings') {
      if(!requireLogin()) return;
      document.getElementById('view-bookings').classList.add('active');
      renderBookings();
    } else {
      // It's a catalog view (movies, flights, etc)
      document.getElementById('view-catalog').classList.add('active');
      renderCatalog(viewName);
    }
    
    if(window.innerWidth <= 768) {
      document.getElementById('sidebar').classList.remove('open');
    }
  }

  function changeLocation() {
    state.location = document.getElementById('globalLocation').value;
    document.getElementById('trendingCityBadge').textContent = state.location;
    if(state.activeView !== 'home' && state.activeView !== 'wishlist' && state.activeView !== 'bookings') {
      renderCatalog(state.activeView);
    }
    showToast(`Location changed to ${state.location}`);
  }

  function requireLogin() {
    if (!state.currentUser) {
      openModal('authModal');
      showToast('Please login to continue', 'error');
      return false;
    }
    return true;
  }

  // ==========================================
  // RENDERING LOGIC
  // ==========================================
  function renderDashboard() {
    document.getElementById('dashBookingsCount').textContent = state.bookings.length;
    document.getElementById('dashWishlistCount').textContent = state.wishlist.length;
    
    const recent = document.getElementById('dashboardRecentBookings');
    if (state.bookings.length === 0) {
      recent.innerHTML = '<div class="text-muted">No recent bookings. Start exploring!</div>';
    } else {
      recent.innerHTML = state.bookings.slice(0, 3).map(b => `
        <div class="booking-card glass-panel" style="margin-bottom:0.5rem; padding: 1rem;">
          <div>
            <h4 style="margin-bottom:0.2rem;">${b.title}</h4>
            <span style="font-size:0.8rem; color:var(--text-muted);">${b.date}</span>
          </div>
          <button class="btn btn-outline btn-sm" onclick="app.viewPastTicket('${b.bookingId}')">Ticket</button>
        </div>
      `).join('');
    }
  }

  function renderTrending() {
    const container = document.getElementById('trendingContainer');
    // Mix top items from different categories
    const trendingItems = [
      db.movies[0], db.flights[0], db.trains[0], db.sports[0]
    ].filter(Boolean);

    container.innerHTML = trendingItems.map(item => createItemCard(item)).join('');
  }

  function renderCatalog(category) {
    const titleMap = {
      movies: '🎬 Movies & Shows',
      flights: '✈️ Flights',
      trains: '🚆 Trains',
      buses: '🚌 Buses',
      hotels: '🏨 Hotels & Stays',
      sports: '🏆 Sports & IPL'
    };

    document.getElementById('catalogTitle').textContent = titleMap[category] || 'Catalog';
    
    let items = db[category] || [];
    
    // Apply location filter
    if (state.location !== 'All') {
      items = items.filter(i => i.location === state.location || i.location === 'All');
    }

    const grid = document.getElementById('catalogGrid');
    if (items.length === 0) {
      grid.innerHTML = `<div class="text-center text-muted" style="grid-column: 1/-1; padding: 3rem;">No items found for ${state.location}. Try changing location.</div>`;
    } else {
      grid.innerHTML = items.map(item => createItemCard(item)).join('');
    }
  }

  function createItemCard(item) {
    const isWished = state.wishlist.some(w => w.id === item.id);
    return `
      <div class="item-card glass-panel">
        <button class="wishlist-btn ${isWished ? 'active' : ''}" onclick="app.toggleWishlist('${item.id}', '${item.category}', event)">
          <i class="fas fa-heart"></i>
        </button>
        <img src="${item.image}" alt="${item.title}" class="item-img">
        <div class="item-content">
          <h3 class="item-title">${item.title}</h3>
          <div class="item-meta">
            <span><i class="fas fa-map-marker-alt"></i> ${item.location}</span>
            <span><i class="far fa-clock"></i> ${item.time}</span>
          </div>
          <div style="display:flex; justify-content: space-between; align-items:center;">
            <span class="item-price">₹${item.price}</span>
            <button class="btn btn-primary btn-sm" onclick="app.initiateBooking('${item.id}', '${item.category}')">Book Now</button>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // WISHLIST LOGIC
  // ==========================================
  function toggleWishlist(itemId, category, event) {
    if (!requireLogin()) return;
    event.stopPropagation();
    
    const item = db[category].find(i => i.id === itemId);
    const index = state.wishlist.findIndex(w => w.id === itemId);
    
    if (index > -1) {
      state.wishlist.splice(index, 1);
      showToast('Removed from Wishlist', 'error');
    } else {
      state.wishlist.push(item);
      showToast('Added to Wishlist');
    }
    
    localStorage.setItem(`eventVerse_wishlist_${state.currentUser.email}`, JSON.stringify(state.wishlist));
    
    // Re-render current view to update heart icon
    if(state.activeView === 'home') renderTrending();
    else if(state.activeView === 'wishlist') renderWishlist();
    else if(state.activeView !== 'bookings') renderCatalog(state.activeView);
  }

  function renderWishlist() {
    const grid = document.getElementById('wishlistGrid');
    if (state.wishlist.length === 0) {
      grid.innerHTML = `<div class="text-muted" style="grid-column: 1/-1; padding: 2rem;">Your wishlist is empty.</div>`;
    } else {
      grid.innerHTML = state.wishlist.map(item => createItemCard(item)).join('');
    }
  }

  // ==========================================
  // BOOKING & SEAT SELECTION
  // ==========================================
  function initiateBooking(itemId, category) {
    if (!requireLogin()) return;
    const item = db[category].find(i => i.id === itemId);
    state.cart = { ...item, quantity: 1, seats: [] };

    if (category === 'buses' || category === 'trains') {
      openModal('travelDetailsModal');
    } else if (category === 'movies' || category === 'sports') {
      openSeatSelection(item);
    } else {
      openPayment(item.price);
    }
  }

  function proceedFromTravelDetails(e) {
    e.preventDefault();
    state.cart.source = document.getElementById('travelSource').value;
    state.cart.destination = document.getElementById('travelDestination').value;
    state.cart.travelDate = document.getElementById('travelDate').value;
    closeModal('travelDetailsModal');
    
    if (state.cart.category === 'buses') {
      openSeatSelection(state.cart);
    } else {
      openPayment(state.cart.price);
    }
  }

  function openSeatSelection(item) {
    currentSeatPrice = item.price;
    selectedSeats = [];
    document.getElementById('selectedSeatCount').textContent = '0';
    document.getElementById('selectedSeatTotal').textContent = '0';
    document.getElementById('seatModalTitle').textContent = `Select Seats for ${item.title}`;
    
    const container = document.getElementById('seatMapContainer');
    container.innerHTML = '';
    
    // Get globally booked seats
    const globallyBooked = state.globalSeats[item.id] || [];
    
    if(item.category === 'movies') {
      document.getElementById('movieScreenIndicator').classList.remove('hidden');
      for(let r=0; r<5; r++) {
        const row = document.createElement('div');
        row.className = 'seat-row';
        for(let c=0; c<8; c++) {
          const seatId = String.fromCharCode(65+r) + (c+1);
          const isBooked = globallyBooked.includes(seatId);
          row.innerHTML += `<div class="seat ${isBooked ? 'booked' : 'available'}" 
                                 onclick="app.toggleSeat(this, '${seatId}')" 
                                 title="Seat ${seatId}"></div>`;
        }
        container.appendChild(row);
      }
    } else if (item.category === 'buses') {
      document.getElementById('movieScreenIndicator').classList.add('hidden');
      for(let r=0; r<6; r++) {
        const row = document.createElement('div');
        row.className = 'seat-row';
        const s1 = `${r+1}A`, s2 = `${r+1}B`, s3 = `${r+1}C`, s4 = `${r+1}D`;
        row.innerHTML = `
          <div class="seat ${globallyBooked.includes(s1)?'booked':'available'}" onclick="app.toggleSeat(this, '${s1}')"></div>
          <div class="seat ${globallyBooked.includes(s2)?'booked':'available'}" onclick="app.toggleSeat(this, '${s2}')"></div>
          <div style="width: 20px;"></div>
          <div class="seat ${globallyBooked.includes(s3)?'booked':'available'}" onclick="app.toggleSeat(this, '${s3}')"></div>
          <div class="seat ${globallyBooked.includes(s4)?'booked':'available'}" onclick="app.toggleSeat(this, '${s4}')"></div>
        `;
        container.appendChild(row);
      }
    } else if (item.category === 'sports') {
      document.getElementById('movieScreenIndicator').classList.add('hidden');
      container.innerHTML = `
        <div class="stadium-container">
          <div class="stadium-stands">
            <div class="stand-group">
              <div class="stand-name">North Stand (₹${item.price})</div>
              <div class="seat-row">
                <div class="seat ${globallyBooked.includes('N1')?'booked':'available'}" onclick="app.toggleSeat(this, 'N1')"></div>
                <div class="seat ${globallyBooked.includes('N2')?'booked':'available'}" onclick="app.toggleSeat(this, 'N2')"></div>
                <div class="seat ${globallyBooked.includes('N3')?'booked':'available'}" onclick="app.toggleSeat(this, 'N3')"></div>
              </div>
            </div>
            <div class="stand-group">
              <div class="stand-name">South Stand (₹${item.price})</div>
              <div class="seat-row">
                <div class="seat ${globallyBooked.includes('S1')?'booked':'available'}" onclick="app.toggleSeat(this, 'S1')"></div>
                <div class="seat ${globallyBooked.includes('S2')?'booked':'available'}" onclick="app.toggleSeat(this, 'S2')"></div>
                <div class="seat ${globallyBooked.includes('S3')?'booked':'available'}" onclick="app.toggleSeat(this, 'S3')"></div>
              </div>
            </div>
          </div>
          <div class="stadium-field">PITCH</div>
          <div class="stadium-stands">
            <div class="stand-group">
              <div class="stand-name">VIP Pavilion (₹${item.price * 2})</div>
              <div class="seat-row">
                <div class="seat ${globallyBooked.includes('V1')?'booked':'available'}" onclick="app.toggleSeat(this, 'V1')"></div>
                <div class="seat ${globallyBooked.includes('V2')?'booked':'available'}" onclick="app.toggleSeat(this, 'V2')"></div>
              </div>
            </div>
            <div class="stand-group">
              <div class="stand-name">East Stand (₹${item.price})</div>
              <div class="seat-row">
                <div class="seat ${globallyBooked.includes('E1')?'booked':'available'}" onclick="app.toggleSeat(this, 'E1')"></div>
                <div class="seat ${globallyBooked.includes('E2')?'booked':'available'}" onclick="app.toggleSeat(this, 'E2')"></div>
              </div>
            </div>
          </div>
        </div>
      `;
    }
    
    openModal('seatModal');
  }

  function calculateSeatTotal() {
    return selectedSeats.reduce((sum, id) => {
      return sum + (id.startsWith('V') ? currentSeatPrice * 2 : currentSeatPrice);
    }, 0);
  }

  function toggleSeat(seatEl, seatId) {
    if (seatEl.classList.contains('booked')) return;
    
    if (seatEl.classList.contains('selected')) {
      seatEl.classList.remove('selected');
      selectedSeats = selectedSeats.filter(id => id !== seatId);
    } else {
      seatEl.classList.add('selected');
      selectedSeats.push(seatId);
    }
    
    document.getElementById('selectedSeatCount').textContent = selectedSeats.length;
    document.getElementById('selectedSeatTotal').textContent = calculateSeatTotal();
  }

  function proceedToCheckoutFromSeats() {
    if (selectedSeats.length === 0) {
      showToast('Please select at least one seat', 'error');
      return;
    }
    state.cart.seats = selectedSeats;
    state.cart.quantity = selectedSeats.length;
    state.cart.totalPrice = calculateSeatTotal();
    
    closeModal('seatModal');
    openPayment(state.cart.totalPrice);
  }

  // ==========================================
  // PAYMENT GATEWAY SIMULATION
  // ==========================================
  function switchPaymentTab(tab) {
    document.querySelectorAll('#paymentTabs .tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`#paymentTabs .tab-btn[onclick="app.switchPaymentTab('${tab}')"]`).classList.add('active');
    
    if (tab === 'card') {
      document.getElementById('paymentForm').classList.remove('hidden');
      document.getElementById('upiForm').classList.add('hidden');
    } else {
      document.getElementById('paymentForm').classList.add('hidden');
      document.getElementById('upiForm').classList.remove('hidden');
    }
  }

  function selectUpi(appName) {
    document.querySelectorAll('.upi-btn').forEach(b => b.classList.remove('active'));
    event.currentTarget.classList.add('active');
    document.getElementById('upiId').placeholder = `Enter your ${appName} UPI ID`;
  }

  function openPayment(amount) {
    // Determine total
    if(!state.cart.totalPrice) state.cart.totalPrice = amount;
    
    let travelDetails = '';
    if (state.cart.source && state.cart.destination) {
      travelDetails = `<p><strong>Route:</strong> <span>${state.cart.source} to ${state.cart.destination}</span></p>`;
    }
    
    const summary = document.getElementById('paymentSummary');
    summary.innerHTML = `
      <p><strong>Booking:</strong> <span>${state.cart.title}</span></p>
      ${travelDetails}
      ${state.cart.seats.length ? `<p><strong>Seats:</strong> <span>${state.cart.seats.join(', ')}</span></p>` : ''}
      <hr style="border:0; border-top:1px solid var(--glass-border); margin:10px 0;">
      <p style="font-size:1.2rem; color:var(--accent-blue);"><strong>Total to Pay:</strong> <span>₹${state.cart.totalPrice}</span></p>
    `;

    // Reset forms
    document.getElementById('paymentTabs').classList.remove('hidden');
    switchPaymentTab('card');
    document.getElementById('otpForm').classList.add('hidden');
    document.getElementById('paymentSuccess').classList.add('hidden');
    document.getElementById('paymentForm').reset();
    document.getElementById('upiForm').reset();
    document.querySelectorAll('.upi-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('otpForm').reset();

    openModal('paymentModal');
  }

  function handlePaymentStep1(e) {
    e.preventDefault();
    // Simulate processing
    const btn = e.target.querySelector('button[type="submit"]');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    setTimeout(() => {
      document.getElementById('paymentForm').classList.add('hidden');
      document.getElementById('upiForm').classList.add('hidden');
      document.getElementById('paymentTabs').classList.add('hidden');
      document.getElementById('otpForm').classList.remove('hidden');
      btn.innerHTML = 'Pay Now';
    }, 1000);
  }

  function handlePaymentStep2(e) {
    e.preventDefault();
    const btn = document.getElementById('verifyOtpBtn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
    
    setTimeout(() => {
      document.getElementById('otpForm').classList.add('hidden');
      document.getElementById('paymentSuccess').classList.remove('hidden');
      processFinalBooking();
      btn.innerHTML = 'Verify & Book';
    }, 1500);
  }

  function processFinalBooking() {
    const booking = {
      ...state.cart,
      bookingId: 'EV' + Math.floor(Math.random() * 1000000),
      date: state.cart.travelDate || new Date().toLocaleDateString(),
      status: 'Confirmed'
    };
    
    state.bookings.unshift(booking);
    localStorage.setItem(`eventVerse_bookings_${state.currentUser.email}`, JSON.stringify(state.bookings));
    
    // Save globally booked seats
    if (booking.seats && booking.seats.length > 0) {
      if (!state.globalSeats[booking.id]) {
        state.globalSeats[booking.id] = [];
      }
      state.globalSeats[booking.id] = [...state.globalSeats[booking.id], ...booking.seats];
      localStorage.setItem('eventVerse_global_seats', JSON.stringify(state.globalSeats));
    }
    
    // Setup Ticket Modal Data
    generateTicket(booking);
  }

  // ==========================================
  // QR TICKET GENERATION
  // ==========================================
  function generateTicket(booking) {
    const wrapper = document.getElementById('ticketWrapper');
    let travelRow = '';
    if (booking.source && booking.destination) {
      travelRow = `
        <div class="ticket-row">
          <div>
            <div class="ticket-label">Route</div>
            <div class="ticket-value">${booking.source} ➔ ${booking.destination}</div>
          </div>
        </div>
      `;
    }

    wrapper.innerHTML = `
      <div class="ticket-header">
        <h2>EventVerse Pass</h2>
        <p>${booking.bookingId}</p>
      </div>
      <div class="ticket-body">
        <div class="ticket-row">
          <div>
            <div class="ticket-label">Event/Travel</div>
            <div class="ticket-value">${booking.title}</div>
          </div>
        </div>
        ${travelRow}
        <div class="ticket-row">
          <div>
            <div class="ticket-label">Date</div>
            <div class="ticket-value">${booking.date}</div>
          </div>
          <div>
            <div class="ticket-label">Time</div>
            <div class="ticket-value">${booking.time}</div>
          </div>
        </div>
        ${booking.seats && booking.seats.length ? `
        <div class="ticket-row">
          <div>
            <div class="ticket-label">Seats</div>
            <div class="ticket-value">${booking.seats.join(', ')}</div>
          </div>
        </div>` : ''}
        <div class="qr-container" id="qrcode"></div>
      </div>
    `;

    // Generate QR Code using CDN library
    setTimeout(() => {
      document.getElementById('qrcode').innerHTML = '';
      new QRCode(document.getElementById("qrcode"), {
        text: `VERIFIED:${booking.bookingId}|${booking.title}|${state.currentUser.email}`,
        width: 120,
        height: 120,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
      });
    }, 100);
  }

  function showTicketAfterPayment() {
    closeModal('paymentModal');
    openModal('ticketModal');
    if(state.activeView === 'bookings') renderBookings();
  }

  // ==========================================
  // MY BOOKINGS
  // ==========================================
  function renderBookings() {
    const list = document.getElementById('bookingsList');
    if (state.bookings.length === 0) {
      list.innerHTML = `<div class="text-muted glass-panel" style="padding: 2rem;">No bookings found. Time to explore!</div>`;
      return;
    }

    list.innerHTML = state.bookings.map(b => `
      <div class="booking-card glass-panel">
        <div class="booking-info">
          <h3>${b.title}</h3>
          <div class="booking-meta">
            <span>Booking ID: ${b.bookingId}</span> | 
            <span>Date: ${b.date}</span>
            ${b.seats && b.seats.length ? `| <span>Seats: ${b.seats.join(',')}</span>` : ''}
          </div>
        </div>
        <div>
          <span class="status-badge">Confirmed</span>
          <button class="btn btn-outline btn-sm ml-1" onclick="app.viewPastTicket('${b.bookingId}')">View Ticket</button>
        </div>
      </div>
    `).join('');
  }

  function viewPastTicket(id) {
    const booking = state.bookings.find(b => b.bookingId === id);
    if(booking) {
      generateTicket(booking);
      openModal('ticketModal');
    }
  }

  // ==========================================
  // AI CHATBOT (AURA) - SIMULATED
  // ==========================================
  function toggleChat() {
    const chat = document.getElementById('chatWindow');
    chat.classList.toggle('hidden');
  }

  function handleChatEnter(e) {
    if(e.key === 'Enter') sendChatMessage();
  }

  function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if(!msg) return;

    appendChatMsg(msg, 'user');
    input.value = '';

    // Simulate thinking
    setTimeout(() => {
      const response = simulateAIResponse(msg.toLowerCase());
      appendChatMsg(response, 'ai');
    }, 800);
  }

  function appendChatMsg(text, sender) {
    const body = document.getElementById('chatBody');
    const div = document.createElement('div');
    div.className = `msg ${sender}`;
    div.textContent = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function simulateAIResponse(query) {
    // Smart location/intent mapping simulation without exposing real API keys
    if(query.includes('movie') || query.includes('cinema')) return "I recommend checking out 'Dune: Part Two' or 'Deadpool & Wolverine'. You can book them in the Movies section!";
    if(query.includes('flight') || query.includes('fly')) return "Looking for flights? We have great deals on Emirates and Air India. Head to the Flights tab.";
    if(query.includes('hotel') || query.includes('stay')) return "For a premium stay, the Taj Mahal Palace in Mumbai is highly rated by our users.";
    if(query.includes('mumbai')) {
      app.navigate('movies');
      document.getElementById('globalLocation').value = 'Mumbai';
      changeLocation();
      return "I've set your location to Mumbai. Check out these events happening there!";
    }
    return "I'm Aura! I can help you find flights, movies, or hotels. Try asking 'What movies are playing?' or 'Find flights'.";
  }

  // ==========================================
  // GLOBAL SEARCH
  // ==========================================
  function handleGlobalSearch() {
    const query = document.getElementById('globalSearch').value.toLowerCase();
    if(query.length < 2) {
      renderTrending();
      return;
    }
    
    // Search across all DBs
    let results = [];
    for(let cat in db) {
      results = results.concat(db[cat].filter(item => item.title.toLowerCase().includes(query)));
    }
    
    const container = document.getElementById('trendingContainer');
    if(results.length === 0) {
      container.innerHTML = `<div class="text-muted">No results found for "${query}"</div>`;
    } else {
      container.innerHTML = results.map(item => createItemCard(item)).join('');
    }
  }

  // ==========================================
  // MODAL CONTROLS
  // ==========================================
  function openModal(id) {
    document.getElementById(id).classList.remove('hidden');
  }
  function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
  }

  // Expose public methods
  return {
    init,
    toggleSidebar,
    openModal,
    closeModal,
    switchAuthTab,
    handleAuth,
    logout,
    navigate,
    changeLocation,
    initiateBooking,
    proceedFromTravelDetails,
    toggleSeat,
    proceedToCheckoutFromSeats,
    switchPaymentTab,
    selectUpi,
    handlePaymentStep1,
    handlePaymentStep2,
    showTicketAfterPayment,
    viewPastTicket,
    toggleChat,
    handleChatEnter,
    sendChatMessage,
    toggleWishlist,
    handleGlobalSearch
  };

})();

// Initialize on load
window.addEventListener('DOMContentLoaded', app.init);
